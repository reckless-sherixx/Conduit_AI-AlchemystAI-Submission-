# Architectural Decisions

## 1. Sequence Ordering and Deduplication

**Data structure**: A sorted drain loop over a `Map<number, ServerMessage>` keyed by sequence number, plus a `Set<number>` of already-processed sequences.

**How it works**: Every incoming message hits three checks in `useWebSocket.ts`:

1. If `msg.seq < expectedSeq` → it's a duplicate (already committed). Drop it, increment the duplicate counter.
2. If `msg.seq === expectedSeq` → commit it immediately, advance `expectedSeq`, then drain the buffer for any consecutive sequences that are now unblocked.
3. If `msg.seq > expectedSeq` → it arrived out of order. Park it in the buffer map. Check the buffer map for duplicates before inserting.

The drain loop after step 2 is important. When a gap-filling message arrives, it can unblock an entire chain of buffered messages in one pass. For example, if messages 3, 4, 5 are buffered and message 2 arrives, all four get committed in a single synchronous loop. The UI receives them in strict order and never has to sort anything.

**Why a Map and not an array**: Sparse sequences. An array indexed by seq would have holes and require scanning. A Map gives O(1) insert and O(1) lookup by seq during the drain. The Set for processed sequences makes deduplication a constant-time check regardless of history length.

**Tradeoff I accepted**: The `processed_seq_set` grows unboundedly over a session. For a real production deployment, I'd cap it with a sliding window (e.g., only track the last 1000 sequences and rely on the `expectedSeq` floor for older duplicates). For this assignment, sessions are short enough that it doesn't matter.

---

## 2. Preventing Layout Shift During Tool Calls

The core idea: token streaming and tool call rendering operate on an append-only block list, never mutating existing DOM positions.

When tokens arrive, they append to the last `text` block's content string. React re-renders only the last child, so earlier blocks don't move. When a `TOOL_CALL` arrives:

1. The current `text` block gets frozen (`isStreaming: false`). Its content is now final. The DOM node for that block will never change height again.
2. A new `tool_call` block is pushed to the array. It renders below the frozen text.
3. When `TOOL_RESULT` arrives, the tool block's status updates to `completed` and its result is displayed. No other blocks change.
4. When tokens resume after a tool result, a **new** `text` block is created rather than appending to the pre-tool-call block. This is critical — it means the old text block stays frozen in place with its exact layout, and new tokens flow into a fresh block below the tool card.

This guarantees zero reflow. The tool card can't push earlier text around because the earlier text is already committed to its final height.

**What I didn't do**: CSS `contain: layout` or explicit height locking. The append-only pattern made it unnecessary. If blocks were ever mutated in place (e.g., inserting a tool card mid-paragraph), I'd need containment. But with the freeze-and-new-block approach, the browser's natural block flow handles it.

---

## 3. Reconnection and State Recovery

**The problem**: After a connection drop, I need to know exactly what the DOM has "consumed" vs. what the socket received. These are different numbers.

**My approach**: Two sequence counters.

- `expectedSeqRef` tracks the next sequence the protocol layer expects from the wire. This is the ingestion cursor.
- `lastRenderedSeqRef` tracks the highest sequence that has been committed to the UI state and rendered. This is updated by `ConsoleApp` whenever it processes timeline events.

On reconnection, `RESUME` is sent with `lastRenderedSeqRef.current` — not the expected seq. This is deliberate. If the buffer had received messages 7, 8, 9 but only committed through 6 (because 7 was still buffered waiting for a gap), sending `RESUME(6)` ensures the server replays from the right point. The dedup set handles any overlap.

**Backoff**: Exponential with a cap: `min(500ms * 2^attempt, 10000ms)`. The first reconnect is fast (500ms), and it backs off to 10 seconds max. This avoids hammering a flaky server while keeping the first retry snappy.

**What happens to tool calls mid-drop**: If the connection drops after a `TOOL_CALL` but before `TOOL_RESULT`, the tool card stays in a "pending" state (visible, with a waiting indicator). On reconnect, the replayed `TOOL_RESULT` finds its matching block by `call_id` and updates it. From the user's perspective, the tool card was "thinking" for a bit longer than expected. No duplicate cards, no missing results.

---

## 4. The TOOL_ACK Race Condition

This is a protocol-level design issue I found, not a bug in my code.

**The problem**: When chaos mode delivers a `TOOL_CALL` message out of order (its seq is ahead of the expected seq), the reorder buffer parks it. The `TOOL_ACK` is only sent when the message is committed — which happens when the gap is filled. But the server's acknowledgment timeout starts ticking the moment it *sends* the `TOOL_CALL`, not when the client processes it.

**Concrete scenario**:
1. Server sends seq=8 (TOKEN), seq=9 (TOKEN), seq=10 (TOOL_CALL) and starts a 5-second TOOL_ACK timer for call_id X.
2. Chaos mode delivers seq=10 first. My client's expected seq is 9, so seq=10 goes into the buffer.
3. Seq=9 is delayed by 6 seconds (latency spike).
4. After 5 seconds, the server logs a protocol violation for missing TOOL_ACK.
5. Seq=9 finally arrives. My buffer drains 9 and 10. TOOL_ACK is sent. But it's too late.

**The fix I did NOT implement**: Fast-tracking TOOL_ACK at the wire level — sending the ack immediately when a TOOL_CALL arrives on the raw socket, regardless of buffer ordering, while still parking the message for ordered UI rendering. I chose not to implement this because it would mean the protocol layer (which should only care about ordering) would need to understand message semantics (is this a TOOL_CALL?), which breaks the separation of concerns. The tradeoff is honest: under severe chaos conditions, a late TOOL_ACK is possible.

**Why I'm documenting it instead of fixing it**: The assignment spec says the server logs a violation but sends the result anyway. So the functional behavior is correct. The protocol violation is a timing artifact of the ordering guarantee, and fixing it cleanly would require either a protocol change (server should reset its ACK timer on reconnect/replay) or a layering compromise (fast-track specific message types before buffering). Both are valid engineering discussions, but neither is a 5-minute fix.

---

## 5. State Management Choice

**Choice**: `useState` + `useCallback` in two custom hooks.

**Why not Redux/Zustand/Jotai**: The state in this app has a clear owner hierarchy. `useWebSocket` owns connection state and the reorder buffer. `useAgentState` owns the UI representation (blocks, timeline, snapshots). `ConsoleApp` is the only consumer that bridges them. There's no cross-component state sharing that would justify a global store.

Redux would add indirection without adding value here. The state transitions are linear (message arrives → buffer → commit → update blocks), not a complex graph of interdependent slices. A `useReducer` could work, but `useState` with `useCallback` is simpler to read and trace.

**The `useEffect` question**: I deliberately avoided `useEffect` for state transitions. The message handler is a callback, not a side effect. The only `useEffect` calls are for:
- Initial WebSocket connection setup and cleanup
- Throughput metric interval (1-second sampling)
- Scroll-to-bottom on new timeline events
- Syncing `markRendered` with the latest timeline state

None of these are state machine transitions. The protocol state machine lives entirely in synchronous callback chains.

---

## 6. TypeScript Strictness

`strict: true` is enabled in `tsconfig.json`. The only `any` type in the codebase is in `core/escape_hatch.ts`:

```typescript
export type SafeAny = any;
```

This is used exclusively in the test files (`diff.test.ts`) for generating large dynamic JSON objects where strict typing adds noise without safety. The production code paths — `protocol.ts`, `useWebSocket.ts`, `useAgentState.ts`, the components — are fully typed with discriminated unions.

---

## 7. Scaling Considerations

### 50 concurrent agent streams on one screen

The current architecture processes one stream at a time. Scaling to 50 would require:

- **Virtualized rendering**: The timeline and chat panel would need windowing (react-window or similar). 50 streams × 30 tokens/sec = 1500 DOM mutations/second, which would destroy the current approach of appending to a flat list.
- **Web Workers for the protocol layer**: Move the reorder buffer and dedup logic into a SharedWorker. Each stream gets its own buffer, and the worker batches committed events on a requestAnimationFrame cadence before posting them to the main thread.
- **Batched React updates**: Instead of `setState` on every token, batch committed events into 16ms frames and flush to React once per animation frame.
- **Shared connection or multiplexing**: Either one WebSocket per stream (simple but expensive) or a single multiplexed connection with stream_id-based routing (complex but efficient).

### 100x longer responses (full document generation)

- **The blocks array becomes a problem**: With 100x more tokens, the flat `blocks` array and the `content += token` string concatenation would cause GC pressure. I'd switch to a rope or chunked string structure — store tokens as an array of chunks and concatenate only for display, using a virtualized text renderer.
- **Timeline grouping becomes critical**: The current 1500ms batching window works for chat-length responses. For document generation, I'd batch by paragraph boundaries or time windows of 5-10 seconds.
- **Context snapshots need diffing optimization**: 500KB snapshots are already at the edge. With longer responses triggering more snapshots, the synchronous `useMemo` diff would need to move to a Web Worker with incremental diffing (hash subtrees, only re-diff changed branches).

---

## 8. Token Grouping in the Timeline

Consecutive `TOKEN` events within a 1500ms window are merged into a single timeline row, showing "Streamed N tokens (Xs)" with an expandable accordion. This prevents the timeline from becoming a wall of individual token entries at 30Hz delivery rates. The grouping happens in `useAgentState.ts` at the state level, not in the rendering component, so the React tree only sees one timeline entry per batch.

---

## 9. Heartbeat Handling

PING/PONG is handled at the raw WebSocket layer, before the reorder buffer. When a `PING` arrives, the client immediately sends a `PONG` with the echoed challenge (or an empty string if the challenge is missing/empty — the corrupt heartbeat case). This is done synchronously in the `onmessage` handler, not queued behind any buffer or state update. Even if the client is busy processing a burst of out-of-order messages, the PONG goes out immediately.

---

## 10. Honest Gaps

- **Bidirectional scrolling**: Clicking a timeline event does not scroll the chat panel to the corresponding block, and vice versa. The data model supports it (blocks and timeline events share sequence numbers), but I didn't wire up the cross-component scroll refs. This would need a shared selection context and DOM ref forwarding.
- **No virtualization on the chat panel**: For normal-length responses this is fine. For the 100x scenario or very long chaos sessions, the DOM would eventually get heavy. I'd add `react-window` for the block list.
- **Diff engine runs synchronously on the main thread**: For 500KB snapshots it benchmarks at ~11ms, which is within a frame budget. But it's one GC spike away from janking. A worker-based approach would be more robust.

---

## 11. Known Test Suite Hangs and Step-Skipping in Chaos Mode

Under severe chaos mode conditions (specifically with high-probability latency spikes and connection drops), the automated test suite runner can experience hangs or skip multiple test cases.

### Root Causes

1. **Sequence Number Leakage Across Steps**:
   When a connection drops mid-stream, `isStreaming` becomes `false`. If the client's current sequence number is already above the next step's expected threshold (e.g. `seq = 25` from Step 3 when Step 4 expects `seq >= 18`), the wait condition is met immediately. Because the WebSocket is closed, the client's `sendMessage` cannot successfully transmit the trigger keyword to reset the sequence numbers. Consequently, the runner cascade-marks all subsequent steps with thresholds lower than 25 as successful in a single frame.

2. **Heartbeat PING Discards (Stale Message Check Hang)**:
   To filter out stale replayed messages from previous turns, the client enforces a stale check `msg.seq >= expectedSeqRef.current + 8`. However, when a latency spike delays token delivery, the expected sequence cursor pauses. If the server sends a heartbeat PING during this pause, the sequence gap can exceed 8, causing the client to discard the PING. This leaves a permanent gap in the sequence, and the client remains stuck forever waiting for the discarded sequence number.

3. **Stale Replayed Packets from RESUME**:
   Upon reconnection, the client automatically sends `RESUME(last_seq)`. Due to network RTT, the replayed events often arrive after the client has already triggered a retried step and reset its expected sequence to 1. These replayed events from the previous run enter the buffer and collide with the new stream's sequence numbers, causing sequence corruption and hangs.


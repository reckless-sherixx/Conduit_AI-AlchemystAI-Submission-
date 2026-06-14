# Conduit

A Next.js agent observability console that connects to a mock AI agent backend over WebSockets. It renders streaming token responses with mid-stream tool call interruptions, displays a live trace timeline, visualizes context snapshot diffs, and survives the backend's chaos mode (connection drops, out-of-order delivery, duplicates, corrupt heartbeats) without crashing or losing state.

The architecture separates protocol ingestion from rendering. A sequence-gated reorder buffer sits between the raw WebSocket and the React state layer, enforcing strict monotonic ordering before any event touches the DOM. This means the UI never sees out-of-order or duplicate data, even when the network is actively hostile.

## Chaos Mode Recording

Link to Loom : https://www.loom.com/share/bbc2634c974e4c3b93cf9b95e294ff50

https://github.com/user-attachments/assets/cae5fd12-9833-499f-b6fb-a1608085478d

## Run It

### Prerequisites
- Node.js 20+
- Docker

### Start the backend
```bash
cd agent-server
docker build -t agent-server .
docker run -p 4747:4747 agent-server              # normal mode
docker run -p 4747:4747 agent-server --mode chaos  # chaos mode
```

### Start the frontend
```bash
cd agent-console
npm install
npm run dev
```

Open `http://localhost:3000`.

### Run tests
```bash
cd agent-console
npm run test
```


## WebSocket Connection State Machine

<img width="683" height="454" alt="{F7C6E39A-ACDD-43EB-A3B9-A1C061597D56}" src="https://github.com/user-attachments/assets/291f4818-a284-4bf5-b2d3-01938cdb1d06" />

## What's Inside

| Directory | Purpose |
|---|---|
| `agent-console/hooks/useWebSocket.ts` | Protocol layer: seq buffer, dedup, backoff reconnect, RESUME, PONG |
| `agent-console/hooks/useAgentState.ts` | UI state: stream blocks, timeline event batching, context snapshots |
| `agent-console/components/` | React components: chat feed, trace timeline, context inspector, test runner |
| `agent-console/core/` | Standalone `ProtocolEngine` class, typed event definitions, `SafeAny` escape hatch |
| `agent-console/utils/diff.ts` | Recursive JSON diff engine for context snapshots |
| `agent-console/tests/` | Vitest suites for reorder buffer, diff engine, and reconnect state recovery |
| `agent-server/` | Provided Docker backend (not modified) |
| `DECISIONS.md` | Architectural decisions and tradeoffs |

# Graph Report - Conduit  (2026-06-13)

## Corpus Check
- 40 files · ~17,974 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 385 nodes · 546 edges · 37 communities (29 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4fb4c13e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]

## God Nodes (most connected - your core abstractions)
1. `AgentServer` - 25 edges
2. `compilerOptions` - 16 edges
3. `Conduit — Agent Observability Console` - 15 edges
4. `Full Stack AI Engineer Assignment` - 15 edges
5. `compilerOptions` - 14 edges
6. `ProtocolEngine` - 12 edges
7. `ChaosEngine` - 11 edges
8. `sleep()` - 10 edges
9. `main()` - 10 edges
10. `assert()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Chaos Mode` --conceptually_related_to--> `ChaosEngine`  [INFERRED]
  README.md → agent-server/src/chaos.ts
- `WebSocket Protocol` --conceptually_related_to--> `AgentServer`  [INFERRED]
  README.md → agent-server/src/server.ts
- `Trigger Keywords` --references--> `RESPONSE_SCRIPTS`  [INFERRED]
  agent-server/README.md → agent-server/src/scripts.ts
- `ConsoleApp()` --calls--> `useWebSocket()`  [EXTRACTED]
  agent-console/components/ConsoleApp.tsx → agent-console/hooks/useWebSocket.ts
- `ConsoleApp()` --calls--> `useAgentState()`  [EXTRACTED]
  agent-console/components/ConsoleApp.tsx → agent-console/hooks/useAgentState.ts

## Hyperedges (group relationships)
- **Agent Console Core Features** — readme_streaming_chat, readme_trace_timeline, readme_context_inspector, readme_reconnection_recovery [EXTRACTED 1.00]
- **Chaos Testing Scenarios** — readme_chaos_mode, readme_chaos_survival, src_chaos_chaosengine [INFERRED 0.85]

## Communities (37 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (10): Agent Console, Chaos Mode, Chaos Survival (Task 5), Context Inspector (Task 3), Reconnection with State Recovery (Task 4), Sequence Number Rules, Streaming Chat with Tool Call Interruptions (Task 1), Agent Trace Timeline (Task 2) (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (17): dependencies, ws, description, devDependencies, tsx, @types/node, @types/ws, typescript (+9 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (15): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, resolveJsonModule (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (11): AgentEvent, AgentEventInput, DistributiveOmit, ProtocolEngineState, StreamState, ProtocolEngine, engine, event_1 (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (30): Trigger Keywords, ChaosEngine, generateChaosConfig(), { mode, port }, parseArgs(), server, generateLargeContext(), RESPONSE_SCRIPTS (+22 more)

### Community 5 - "Community 5"
Cohesion: 0.60
Nodes (12): assert(), connect(), main(), sleep(), testLargeContext(), testMultiToolFlow(), testNormalFlow(), testPingPong() (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (10): ErrorMessage, PingMessage, PongPayload, ResumePayload, StreamEndMessage, TokenMessage, ToolAckPayload, ToolCallMessage (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.21
Nodes (13): 1. Prerequisites, 2. Start the Backend Server, 2. Start the Mock Backend Server, 3. Start the Next.js Frontend, 3. Start the Next.js Frontend Console, Appendix: Quick Protocol Interaction Example, code:bash (cd agent-server), code:bash (docker run -p 4747:4747 agent-server --mode chaos) (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (26): dependencies, next, react, react-dom, devDependencies, eslint, eslint-config-next, happy-dom (+18 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (12): Agent Server, Chaos Mode, code:bash (docker build -t agent-server .), code:bash (npm install), code:bash (curl -s http://localhost:4747/log | python3 -m json.tool), Docker (recommended), Endpoints, Local (for inspection) (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (6): dmSans, geistMono, geistSans, jetbrainsMono, metadata, outfit

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

### Community 23 - "Community 23"
Cohesion: 0.23
Nodes (9): ContextInspectorProps, flattenDiffNode(), flattenObject(), TreeEntry, ViewMode, computeDiff(), DiffNode, DiffStatus (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.17
Nodes (8): badgeColors, DOT_COLORS, EVENT_TYPE_COLORS, FILTER_OPTIONS, FILTERS, FilterType, LABEL_COLORS, TraceTimelineProps

### Community 25 - "Community 25"
Cohesion: 0.24
Nodes (7): AutoTestRunner(), AutoTestRunnerProps, TestStep, ConsoleApp(), ContextInspector(), TraceTimeline(), useAgentState()

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (7): ChatPanel(), ChatPanelProps, BlockStatus, ContextSnapshot, MessageBlock, TimelineEvent, ContextSnapshotMessage

### Community 27 - "Community 27"
Cohesion: 0.22
Nodes (8): 1. UI Design & Styling System (Neobrutalism), 2. Bidirectional Observability Layout, 3. Real-Time Telemetry & WebSocket Metrics, 4. Automated Integration Test Suite (Auto Test Runner), Architectural Decisions — Conduit Agent Observability Console, Sequence of Automated Tests, State Management & Stability, Styling Choice: Teal & Cream Custom Palette

### Community 28 - "Community 28"
Cohesion: 0.15
Nodes (10): SafeAny, diff, DiffResult, end, KeyPath, new_json, new_large, old_json (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.18
Nodes (9): useWebSocket(), UseWebSocketOptions, WebSocketState, WsMetrics, MockWebSocket, onMessageMock, { result }, ClientMessage (+1 more)

### Community 31 - "Community 31"
Cohesion: 0.14
Nodes (13): Architectural Approach, code:bash (cd agent-console), Conduit — Agent Observability Console, Console Features, Controls:, Design System & Palette, Features, Live Telemetry Metrics (+5 more)

### Community 32 - "Community 32"
Cohesion: 0.20
Nodes (10): Deliverables, Evaluation Criteria, Full Stack AI Engineer Assignment, Overview, Prerequisites, Technical Constraints, Timeline, What Will Get You Rejected (+2 more)

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (6): Task 1  Streaming Chat with Tool Call Interruptions, Task 2  Agent Trace Timeline, Task 3  Context Inspector, Task 4  Reconnection with State Recovery, Task 5  Chaos Survival, What to Build

### Community 34 - "Community 34"
Cohesion: 0.40
Nodes (5): Chaos Mode Behaviours, Client → Server Messages, Protocol Reference, Sequence Number Rules, Server → Client Messages

### Community 35 - "Community 35"
Cohesion: 0.50
Nodes (4): A. Streamed Response with Tool Call, B. Trace Timeline, C. Context Inspector, Visual Walkthrough & Screenshots

### Community 36 - "Community 36"
Cohesion: 0.67
Nodes (3): code:mermaid (stateDiagram-v2), State Machine Diagram, The Agent Server

## Knowledge Gaps
- **169 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentServer` connect `Community 0` to `Community 4`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `Full Stack AI Engineer Assignment` connect `Community 32` to `Community 33`, `Community 34`, `Community 36`, `Community 7`, `Community 31`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `Conduit — Agent Observability Console` connect `Community 31` to `Community 35`, `Community 36`, `Community 7`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _173 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12183908045977011 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.14619883040935672 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1323529411764706 - nodes in this community are weakly interconnected._
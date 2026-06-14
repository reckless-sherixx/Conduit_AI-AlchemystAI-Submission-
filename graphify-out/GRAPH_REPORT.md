# Graph Report - Conduit  (2026-06-14)

## Corpus Check
- 40 files · ~19,061 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 322 nodes · 407 edges · 25 communities (18 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1b6e7e13`
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
- [[_COMMUNITY_Community 21|Community 21]]

## God Nodes (most connected - your core abstractions)
1. `AgentServer` - 22 edges
2. `compilerOptions` - 16 edges
3. `compilerOptions` - 13 edges
4. `ProtocolEngine` - 12 edges
5. `Architectural Decisions` - 12 edges
6. `sleep()` - 9 edges
7. `main()` - 9 edges
8. `assert()` - 8 edges
9. `connect()` - 8 edges
10. `ChaosEngine` - 8 edges

## Surprising Connections (you probably didn't know these)
- `ConsoleApp()` --calls--> `useAgentState()`  [EXTRACTED]
  agent-console/components/ConsoleApp.tsx → agent-console/hooks/useAgentState.ts
- `ConsoleApp()` --calls--> `useWebSocket()`  [EXTRACTED]
  agent-console/components/ConsoleApp.tsx → agent-console/hooks/useWebSocket.ts

## Communities (25 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (27): ChaosEngine, generateChaosConfig(), { mode, port }, server, RESPONSE_SCRIPTS, selectScript(), ChaosConfig, ClientLogEntry (+19 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (34): AutoTestRunner(), AutoTestRunnerProps, TestStep, ChatPanel(), ChatPanelProps, ConsoleApp(), EVENT_TYPE_COLORS, FILTER_OPTIONS (+26 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (26): dependencies, next, react, react-dom, devDependencies, eslint, eslint-config-next, happy-dom (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (11): AgentEvent, AgentEventInput, DistributiveOmit, ProtocolEngineState, StreamState, ProtocolEngine, engine, event_1 (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.23
Nodes (10): ContextInspector(), ContextInspectorProps, flattenDiffNode(), flattenObject(), TreeEntry, ContextSnapshot, computeDiff(), DiffNode (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (17): dependencies, ws, description, devDependencies, tsx, @types/node, @types/ws, typescript (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, resolveJsonModule (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (16): 100x longer responses (full document generation), 10. Honest Gaps, 11. Known Test Suite Hangs and Step-Skipping in Chaos Mode, 1. Sequence Ordering and Deduplication, 2. Preventing Layout Shift During Tool Calls, 3. Reconnection and State Recovery, 4. The TOOL_ACK Race Condition, 50 concurrent agent streams on one screen (+8 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (10): SafeAny, diff, DiffResult, end, KeyPath, new_json, new_large, old_json (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (13): Architecture at a Glance, Chaos Mode Recording, code:bash (cd agent-server), code:bash (cd agent-console), code:bash (cd agent-console), code:block4 (WebSocket frames), Conduit, Prerequisites (+5 more)

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (12): Agent Server, Chaos Mode, code:bash (docker build -t agent-server .), code:bash (npm install), code:bash (curl -s http://localhost:4747/log | python3 -m json.tool), Docker (recommended), Endpoints, Local (for inspection) (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.55
Nodes (12): assert(), connect(), main(), sleep(), testLargeContext(), testMultiToolFlow(), testNormalFlow(), testPingPong() (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (4): dmSans, jetbrainsMono, metadata, outfit

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **165 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+160 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentServer` connect `Community 5` to `Community 0`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _165 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06923076923076923 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05920444033302498 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.12318840579710146 - nodes in this community are weakly interconnected._
- **Should `Community 6` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
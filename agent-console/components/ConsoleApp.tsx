"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAgentState } from '../hooks/useAgentState';
import { ChatPanel } from './ChatPanel';
import { TraceTimeline } from './TraceTimeline';
import { ContextInspector } from './ContextInspector';
import { AutoTestRunner } from './AutoTestRunner';

export function ConsoleApp() {
  const { blocks, timeline, snapshots, handleMessage, markToolAcked, addUserMessage, isStreaming, resetState } = useAgentState();
  const [userInput, setUserInput] = useState('');
  const [displaySeq, setDisplaySeq] = useState(0);
  const [suiteRunTrigger, setSuiteRunTrigger] = useState(0);
  const targetSeqRef = useRef(0);

  const { status, sendMessage, markRendered, currentSeq, reconnectAttempt, backoffMs, forceReconnect, disconnect, resetSession, triggerNetworkDrop, metrics } = useWebSocket({
    url: 'ws://localhost:4747/ws',
    onMessage: (msg) => {
      handleMessage(msg);
      if (msg.type === 'TOOL_CALL') {
        sendMessage({ type: 'TOOL_ACK', call_id: msg.call_id });
        markToolAcked(msg.call_id);
      }
    }
  });

  
  useEffect(() => {
    targetSeqRef.current = currentSeq;
  }, [currentSeq]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplaySeq(prev => {
        if (prev < targetSeqRef.current) return prev + 1;
        return prev;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    if (timeline.length > 0) {
      const lastEvt = timeline[timeline.length - 1];
      const highestSeq = Math.max(...lastEvt.seqs);
      markRendered(highestSeq);
    }
  }, [timeline, markRendered]);

  const handleSend = (content?: string) => {
    const text = content || userInput;
    if (!text.trim()) return;
    addUserMessage(text);
    sendMessage({ type: 'USER_MESSAGE', content: text });
    if (!content) setUserInput('');
  };

  const handleResetSession = () => {
    resetState();
    resetSession();
  };

  const statusColor = status === 'connected' ? 'var(--color-accent-green)' : status === 'connecting' ? 'var(--color-accent-blue)' : 'var(--color-accent-red)';
  const statusBg = status === 'connected' ? 'bg-[var(--color-accent-green)]' : status === 'connecting' ? 'bg-[var(--color-accent-blue)]' : 'bg-[var(--color-accent-red)]';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden p-4 gap-3" style={{ fontFamily: 'var(--font-mono)' }}>

      {}
      <div className="nb-card flex items-center justify-between px-5 py-3 shrink-0">
        <div className="flex flex-col gap-0.5">
          <h1 className="nb-title text-xl tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            CONDUIT AI OBSERVABILITY NODE
          </h1>
          <div className="flex items-center gap-2 text-xs text-[var(--color-muted-text)]">
            <span>Event-sourced agent console connection:</span>
            <span className="nb-badge bg-[var(--color-main)] text-[var(--color-main-foreground)]">
              ws:
            </span>
          </div>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="nb-btn nb-btn-primary text-xs"
        >
          GITHUB
        </a>
      </div>

      {}
      <div className="nb-card px-5 py-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-3.5 h-3.5 rounded-full border-2 border-black animate-pulse-dot"
              style={{ backgroundColor: statusColor }}
            />
            <span className="nb-title text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
              OBSERVABILITY NODE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="nb-btn nb-btn-primary text-[0.65rem]" onClick={() => setSuiteRunTrigger(prev => prev + 1)}>
              RUN AUTO SUITE
            </button>
            <button
              className="nb-btn text-[0.65rem]"
              onClick={status === 'connected' ? disconnect : forceReconnect}
            >
              {status === 'connected' ? 'DISCONNECT' : 'RECONNECT'}
            </button>
            <button className="nb-btn text-[0.65rem]" onClick={handleResetSession}>
              RESET SESSION
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="nb-metric">
            <span className="nb-metric-label">Transport State</span>
            <span className={`nb-metric-value text-sm font-black uppercase ${statusBg} inline-block px-2 border-2 border-black`}>
              {status}
            </span>
          </div>
          <div className="nb-metric">
            <span className="nb-metric-label">Expected Seq</span>
            <span className="nb-metric-value">{displaySeq}</span>
          </div>
          <div className="nb-metric">
            <span className="nb-metric-label">Last Committed</span>
            <span className="nb-metric-value">
              <span className="bg-[var(--color-accent-green)] px-1.5 border-2 border-black text-sm">{currentSeq}</span>
            </span>
          </div>
          <div className="nb-metric">
            <span className="nb-metric-label">Buffer Size</span>
            <span className={`nb-metric-value ${metrics.bufferSize > 0 ? 'text-[var(--color-accent-red)]' : ''}`}>
              {metrics.bufferSize}
            </span>
          </div>
          <div className="nb-metric">
            <span className="nb-metric-label">Duplicate Drops</span>
            <span className="nb-metric-value">{metrics.duplicateDrops}</span>
          </div>
          <div className="nb-metric">
            <span className="nb-metric-label">Heartbeat Latency</span>
            <span className="nb-metric-value">{metrics.heartbeatLatencyMs} ms</span>
          </div>
          <div className="nb-metric">
            <span className="nb-metric-label">Throughput</span>
            <span className="nb-metric-value">{metrics.eventThroughput}</span>
          </div>
          <div className="nb-metric">
            <span className="nb-metric-label">Reconnects</span>
            <span className="nb-metric-value">{metrics.reconnectCount}</span>
          </div>
        </div>
      </div>

      {}
      {status !== 'connected' && (
        <div className="nb-card bg-[var(--color-accent-amber)] flex items-center gap-3 px-4 py-2 shrink-0">
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin-slow" />
          <span className="nb-mono text-xs font-bold">
            Reconnecting… last_seq={currentSeq} · attempt {reconnectAttempt}/5 · backoff {(backoffMs / 1000).toFixed(1)}s
          </span>
        </div>
      )}

      {}
      <div className="flex flex-1 min-h-0 gap-3 overflow-hidden">
        {}
        <div className="nb-card flex flex-col w-[280px] shrink-0 overflow-hidden">
          <div className="px-3 py-2 border-b-2 border-black bg-[var(--color-secondary-bg)]">
            <h2 className="nb-title text-xs" style={{ fontFamily: 'var(--font-heading)' }}>TRACE TIMELINE</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <TraceTimeline events={timeline} />
          </div>
        </div>

        {}
        <div className="nb-card flex flex-col flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b-2 border-black bg-[var(--color-secondary-bg)]">
            <h2 className="nb-title text-xs" style={{ fontFamily: 'var(--font-heading)' }}>STREAMING FEED</h2>
            {isStreaming && (
              <span className="nb-badge bg-[var(--color-accent-green)] text-black">
                ● STREAMING
              </span>
            )}
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <ChatPanel blocks={blocks} />
          </div>
          {}
          <div className="flex items-center gap-2 px-3 py-2 border-t-2 border-black bg-[var(--color-secondary-bg)]">
            <input
              type="text"
              className="nb-input flex-1 text-xs"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Enter trigger keyword (e.g. hello, summary, analyze)..."
              disabled={status !== 'connected'}
            />
            <button
              className="nb-btn nb-btn-primary text-[0.65rem]"
              onClick={() => handleSend()}
              disabled={status !== 'connected' || !userInput.trim()}
            >
              SEND
            </button>
          </div>
        </div>

        {}
        <div className="nb-card flex flex-col w-[280px] shrink-0 overflow-hidden">
          <div className="px-3 py-2 border-b-2 border-black bg-[var(--color-secondary-bg)]">
            <h2 className="nb-title text-xs" style={{ fontFamily: 'var(--font-heading)' }}>CONTEXT STATE</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <ContextInspector snapshots={snapshots} />
          </div>
        </div>
      </div>

      {}
      <AutoTestRunner
        status={status}
        onSend={handleSend}
        currentSeq={currentSeq}
        isStreaming={isStreaming}
        runTrigger={suiteRunTrigger}
      />
    </div>
  );
}

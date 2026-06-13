"use client";

import React, { useEffect, useRef } from 'react';
import { MessageBlock } from '../hooks/useAgentState';

interface ChatPanelProps {
  blocks: MessageBlock[];
}

export function ChatPanel({ blocks }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [blocks]);

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div className="nb-card flex flex-col items-center gap-4 p-8 max-w-md text-center">
          <div className="w-14 h-14 flex items-center justify-center text-2xl bg-[var(--color-main)] border-2 border-black" style={{ boxShadow: 'var(--shadow-flat-sm)' }}>
            ⚡
          </div>
          <h3 className="nb-title text-lg" style={{ fontFamily: 'var(--font-heading)' }}>STREAMING FEED</h3>
          <p className="text-sm text-[var(--color-muted-text)] font-semibold leading-relaxed">
            Send a message to start the agent. Type a keyword like <strong>hello</strong>, <strong>summary</strong>, or <strong>analyze</strong> to trigger a response.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {['hello', 'summary', 'analyze', 'find', 'large', 'long', 'help'].map(kw => (
              <span key={kw} className="nb-badge bg-white cursor-default">{kw}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-3 gap-3">
      {blocks.map((block) => {


        if (block.type === 'user') {
          return (
            <div key={block.id} className="nb-card bg-[var(--color-secondary-bg)] p-3 max-w-[85%]">
              <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
                {block.content}
              </p>
            </div>
          );
        }


        if (block.type === 'text') {
          return (
            <div key={block.id} className="max-w-[95%]">
              <div className="border-2 border-black overflow-hidden" style={{ boxShadow: 'var(--shadow-flat-sm)' }}>
                { }
                <div className="bg-[var(--color-accent-green)] px-3 py-1 border-b-2 border-black flex items-center justify-between">
                  <span className="nb-mono text-[0.6rem] font-bold uppercase">Agent Response</span>
                  {block.isStreaming && (
                    <span className="nb-badge bg-white text-[0.55rem] py-0">STREAMING…</span>
                  )}
                </div>
                <div className="bg-white p-3">
                  <p className="text-sm leading-[1.7] whitespace-pre-wrap" style={{ fontFamily: 'var(--font-sans)' }}>
                    {block.content}
                    {block.isStreaming && <span className="inline-block w-2 h-4 bg-black ml-0.5 animate-pulse-dot" />}
                  </p>
                </div>
              </div>
            </div>
          );
        }


        if (block.type === 'tool_call') {
          const isDone = block.status === 'completed';
          const headerBg = isDone ? 'bg-[var(--color-accent-green)]' : 'bg-[var(--color-accent-amber)]';
          const statusText = isDone ? 'COMPLETED' : block.status === 'acked' ? 'ACKED' : 'PENDING';
          const statusBg = isDone ? 'bg-[var(--color-accent-green)]' : 'bg-[var(--color-accent-amber)]';

          return (
            <div key={block.id} className="max-w-[95%]" data-call-id={block.call_id}>
              <div className="border-2 border-black overflow-hidden" style={{ boxShadow: 'var(--shadow-flat-sm)' }}>
                { }
                <div className={`${headerBg} px-3 py-1.5 border-b-2 border-black flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="nb-badge bg-[var(--color-accent-purple)] text-white text-[0.55rem] py-0">
                      TOOL CALL
                    </span>
                    <span className="nb-mono text-[0.7rem] font-bold">{block.name}</span>
                  </div>
                  <span className={`nb-badge ${statusBg} text-black text-[0.55rem] py-0`}>
                    {statusText}
                  </span>
                </div>

                { }
                <div className="bg-white px-3 py-2 border-b border-black/10">
                  <p className="nb-label text-[0.55rem] mb-1">ARGS</p>
                  <pre className="nb-mono text-[0.65rem] leading-relaxed text-[var(--color-secondary-text)] whitespace-pre-wrap break-all">
                    {JSON.stringify(block.args, null, 2)}
                  </pre>
                </div>

                { }
                {isDone && block.result !== undefined && (
                  <div className="bg-[var(--color-accent-green)]/10 px-3 py-2 border-t-2 border-black">
                    <p className="nb-label text-[0.55rem] mb-1">RESULT</p>
                    <pre className="nb-mono text-[0.65rem] leading-relaxed text-[var(--color-fg)] whitespace-pre-wrap break-all">
                      {JSON.stringify(block.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        }

        return null;
      })}
      <div ref={bottomRef} />
    </div>
  );
}

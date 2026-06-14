import { useState, useCallback } from 'react';
import { ServerMessage, ContextSnapshotMessage } from '../types/protocol';

export type BlockStatus = 'pending' | 'acked' | 'completed';

export type MessageBlock =
  | { type: 'user'; id: string; content: string }
  | { type: 'text'; id: string; content: string; isStreaming: boolean; streamId?: string }
  | { type: 'tool_call'; id: string; call_id: string; name: string; args: Record<string, unknown>; result?: unknown; status: BlockStatus };

export interface TimelineEvent {
  id: string;
  type: string;
  timestamp: number;
  data: any;
  tokenCount?: number;
  seqs: number[];
  elapsed?: number;
}

export type ContextSnapshot = ContextSnapshotMessage;

export function useAgentState() {
  const [blocks, setBlocks] = useState<MessageBlock[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [snapshots, setSnapshots] = useState<ContextSnapshotMessage[]>([]);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const addUserMessage = useCallback((content: string) => {
    setBlocks(prev => [...prev, { type: 'user', id: `usr-${Date.now()}`, content }]);
  }, []);

  const resetState = useCallback(() => {
    setBlocks([]);
    setTimeline([]);
    setSnapshots([]);
    setActiveStreamId(null);
    setIsStreaming(false);
  }, []);

  const clearStreaming = useCallback(() => {
    setIsStreaming(false);
    setBlocks(prev => prev.map(b => (b.type === 'text' && b.isStreaming) ? { ...b, isStreaming: false } : b));
  }, []);

  const handleMessage = useCallback((msg: ServerMessage) => {
    const now = Date.now();


    setTimeline(prev => {
      if (msg.type === 'TOKEN' && prev.length > 0) {
        const last = prev[prev.length - 1];
        if (last.type === 'TOKEN' && now - last.timestamp < 1500) {
          const updated = [...prev];
          const startTime = last.timestamp - (last.elapsed || 0);
          updated[updated.length - 1] = {
            ...last,
            timestamp: now,
            tokenCount: (last.tokenCount || 1) + 1,
            seqs: [...last.seqs, msg.seq],
            data: { text: last.data.text + msg.text },
            elapsed: now - startTime,
          };
          return updated;
        }
      }
      return [...prev, {
        id: `evt-${msg.seq}-${now}`,
        type: msg.type,
        timestamp: now,
        data: msg,
        tokenCount: msg.type === 'TOKEN' ? 1 : undefined,
        seqs: [msg.seq],
        elapsed: 0,
      }];
    });

    if (msg.type === 'CONTEXT_SNAPSHOT') {
      setSnapshots(prev => [...prev, msg]);
    }


    if (msg.type === 'TOKEN' && 'stream_id' in msg) {
      setActiveStreamId(msg.stream_id);
      setIsStreaming(true);
    }
    if (msg.type === 'STREAM_END') {
      setIsStreaming(false);
    }


    setBlocks(prev => {
      if (msg.type === 'TOKEN') {
        const last = prev[prev.length - 1];
        if (last && last.type === 'text' && last.isStreaming) {
          const updated = [...prev];
          updated[updated.length - 1] = { ...last, content: last.content + msg.text, streamId: 'stream_id' in msg ? msg.stream_id : undefined };
          return updated;
        } else {
          return [...prev, { type: 'text', id: `txt-${msg.seq}-${now}`, content: msg.text, isStreaming: true, streamId: 'stream_id' in msg ? msg.stream_id : undefined }];
        }
      } else if (msg.type === 'TOOL_CALL') {
        const updated = prev.map((b, i) => (i === prev.length - 1 && b.type === 'text') ? { ...b, isStreaming: false } : b);
        updated.push({
          type: 'tool_call',
          id: `tool-${msg.call_id}`,
          call_id: msg.call_id,
          name: msg.tool_name,
          args: msg.args,
          status: 'pending'
        });
        return updated;
      } else if (msg.type === 'TOOL_RESULT') {
        return prev.map(b => {
          if (b.type === 'tool_call' && b.call_id === msg.call_id) {
            return { ...b, status: 'completed', result: msg.result };
          }
          return b;
        });
      } else if (msg.type === 'STREAM_END') {

        return prev.map((b, i) => (i === prev.length - 1 && b.type === 'text') ? { ...b, isStreaming: false } : b);
      }
      return prev;
    });
  }, []);

  const markToolAcked = useCallback((call_id: string) => {
    setBlocks(prev => prev.map(b =>
      (b.type === 'tool_call' && b.call_id === call_id) ? { ...b, status: 'acked' } : b
    ));
  }, []);

  return { blocks, timeline, snapshots, handleMessage, markToolAcked, addUserMessage, activeStreamId, isStreaming, resetState, clearStreaming };
}

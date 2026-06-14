import { useState, useEffect, useRef, useCallback } from 'react';
import { ServerMessage, ClientMessage } from '../types/protocol';

interface UseWebSocketOptions {
  url: string;
  onMessage: (msg: ServerMessage) => void;
}

export interface WsMetrics {
  reconnectCount: number;
  duplicateDrops: number;
  bufferSize: number;
  heartbeatLatencyMs: number;
  eventThroughput: number;
  replayCount: number;
}

export interface WebSocketState {
  status: 'connecting' | 'connected' | 'disconnected';
  sendMessage: (msg: ClientMessage) => void;
  markRendered: (seq: number) => void;
  currentSeq: number;
  reconnectAttempt: number;
  backoffMs: number;
  lastPingAt: number | null;
  forceReconnect: () => void;
  disconnect: () => void;
  resetSession: () => void;
  triggerNetworkDrop: () => void;
  metrics: WsMetrics;
}

export function useWebSocket({ url, onMessage }: UseWebSocketOptions): WebSocketState {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [currentSeq, setCurrentSeq] = useState(0);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [backoffMs, setBackoffMs] = useState(0);
  const [lastPingAt, setLastPingAt] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<WsMetrics>({
    reconnectCount: 0,
    duplicateDrops: 0,
    bufferSize: 0,
    heartbeatLatencyMs: 0,
    eventThroughput: 0,
    replayCount: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const expectedSeqRef = useRef<number>(1);
  const bufferRef = useRef<ServerMessage[]>([]);
  const lastRenderedSeqRef = useRef<number>(0);

  const reconnectAttemptRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanedUpRef = useRef(false);
  const manualDisconnectRef = useRef(false);

  const duplicateDropsRef = useRef(0);
  const eventCountRef = useRef(0);
  const throughputIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectCountRef = useRef(0);

  const isStreamingRef = useRef(false);
  const lastMessageTimeRef = useRef(0);
  const lastProgressSeqRef = useRef<number>(1);
  const lastProgressTimeRef = useRef(0);

  const sendMessage = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      if (msg.type === 'USER_MESSAGE') {
        expectedSeqRef.current = 1;
        lastRenderedSeqRef.current = 0;
        bufferRef.current = [];
        setCurrentSeq(0);
        isStreamingRef.current = true;
        lastMessageTimeRef.current = Date.now();
        lastProgressSeqRef.current = 1;
        lastProgressTimeRef.current = Date.now();
      }
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const markRendered = useCallback((seq: number) => {
    if (seq > lastRenderedSeqRef.current) {
      lastRenderedSeqRef.current = seq;
    }
  }, []);

  const processBuffer = useCallback(() => {
    let processed = false;
    do {
      processed = false;
      const index = bufferRef.current.findIndex(m => m.seq === expectedSeqRef.current);
      if (index !== -1) {
        const msg = bufferRef.current[index];
        bufferRef.current.splice(index, 1);
        onMessageRef.current(msg);
        expectedSeqRef.current += 1;
        setCurrentSeq(expectedSeqRef.current - 1);
        eventCountRef.current += 1;
        processed = true;
      }
    } while (processed);

    setMetrics(prev => ({ ...prev, bufferSize: bufferRef.current.length }));
  }, []);

  const connect = useCallback(() => {
    if (cleanedUpRef.current || manualDisconnectRef.current || wsRef.current) return;

    setStatus('connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (cleanedUpRef.current) {
        ws.close();
        return;
      }
      setStatus('connected');
      reconnectAttemptRef.current = 0;
      setReconnectAttempt(0);
      setBackoffMs(0);
      lastMessageTimeRef.current = Date.now();
      lastProgressTimeRef.current = Date.now();

      if (lastRenderedSeqRef.current > 0) {
        ws.send(JSON.stringify({ type: 'RESUME', last_seq: lastRenderedSeqRef.current }));
        setMetrics(prev => ({ ...prev, replayCount: prev.replayCount + 1 }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as ServerMessage;
        lastMessageTimeRef.current = Date.now();

        if (msg.type === 'PING') {
          const pingTime = Date.now();
          ws.send(JSON.stringify({ type: 'PONG', echo: msg.challenge || '' }));
          setLastPingAt(pingTime);
          const latency = Date.now() - pingTime;
          setMetrics(prev => ({ ...prev, heartbeatLatencyMs: latency }));
        }

        if (msg.type === 'TOKEN' || msg.type === 'TOOL_CALL' || msg.type === 'CONTEXT_SNAPSHOT') {
          isStreamingRef.current = true;
        }
        if (msg.type === 'STREAM_END') {
          isStreamingRef.current = false;
        }

        if (msg.seq < expectedSeqRef.current) {
          duplicateDropsRef.current += 1;
          setMetrics(prev => ({ ...prev, duplicateDrops: duplicateDropsRef.current }));
          return;
        }

        if (msg.seq === expectedSeqRef.current) {
          onMessageRef.current(msg);
          expectedSeqRef.current += 1;
          setCurrentSeq(expectedSeqRef.current - 1);
          eventCountRef.current += 1;
          processBuffer();
        } else {
          if (!bufferRef.current.some(m => m.seq === msg.seq)) {
            bufferRef.current.push(msg);
            setMetrics(prev => ({ ...prev, bufferSize: bufferRef.current.length }));
          } else {
            duplicateDropsRef.current += 1;
            setMetrics(prev => ({ ...prev, duplicateDrops: duplicateDropsRef.current }));
          }
        }

        if (expectedSeqRef.current !== lastProgressSeqRef.current) {
          lastProgressSeqRef.current = expectedSeqRef.current;
          lastProgressTimeRef.current = Date.now();
        }
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    ws.onclose = (event) => {
      if (ws !== wsRef.current) return;
      wsRef.current = null;
      if (cleanedUpRef.current || manualDisconnectRef.current) return;

      if (event?.reason === 'replaced') {
        setStatus('disconnected');
        console.warn("[WebSocket] Connection closed because it was replaced by a new session.");
        return;
      }

      setStatus('disconnected');
      reconnectCountRef.current += 1;
      setMetrics(prev => ({
        ...prev,
        reconnectCount: reconnectCountRef.current,
      }));
      const attempt = reconnectAttemptRef.current;
      const bo = Math.min(500 * Math.pow(2, attempt), 10000);
      reconnectAttemptRef.current += 1;
      setReconnectAttempt(reconnectAttemptRef.current);
      setBackoffMs(bo);

      reconnectTimeoutRef.current = setTimeout(connect, bo);
    };

    ws.onerror = () => { };
  }, [url, processBuffer]);

  const disconnect = useCallback(() => {
    manualDisconnectRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
    isStreamingRef.current = false;
  }, []);

  const resetSession = useCallback(() => {
    disconnect();

    expectedSeqRef.current = 1;
    bufferRef.current = [];
    lastRenderedSeqRef.current = 0;
    duplicateDropsRef.current = 0;
    eventCountRef.current = 0;
    reconnectCountRef.current = 0;
    reconnectAttemptRef.current = 0;
    setCurrentSeq(0);
    setReconnectAttempt(0);
    setBackoffMs(0);
    setLastPingAt(null);
    setMetrics({
      reconnectCount: 0,
      duplicateDrops: 0,
      bufferSize: 0,
      heartbeatLatencyMs: 0,
      eventThroughput: 0,
      replayCount: 0,
    });

    isStreamingRef.current = false;
    manualDisconnectRef.current = false;
    setTimeout(() => connect(), 200);
  }, [disconnect, connect]);

  const forceReconnect = useCallback(() => {
    manualDisconnectRef.current = false;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectAttemptRef.current = 0;
    setReconnectAttempt(0);

    setTimeout(() => connect(), 100);
  }, [connect]);

  const triggerNetworkDrop = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  useEffect(() => {
    lastMessageTimeRef.current = Date.now();
    lastProgressTimeRef.current = Date.now();

    cleanedUpRef.current = false;
    manualDisconnectRef.current = false;

    throughputIntervalRef.current = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        eventThroughput: eventCountRef.current,
        duplicateDrops: duplicateDropsRef.current,
        reconnectCount: reconnectCountRef.current,
      }));
      eventCountRef.current = 0;

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const now = Date.now();
        const timeSinceLastMessage = now - lastMessageTimeRef.current;

        // Case 1: We are streaming, but haven't heard anything for 9.5s
        if (isStreamingRef.current && timeSinceLastMessage > 9500) {
          console.warn(`[useWebSocket] Stream stall detected: no messages received for ${timeSinceLastMessage}ms. Forcing reconnect...`);
          forceReconnect();
          return;
        }

        // Case 2: Out-of-order buffer stall (we have a sequence hole for > 9.5s)
        if (bufferRef.current.length > 0 && (now - lastProgressTimeRef.current) > 9500) {
          console.warn(`[useWebSocket] Buffer stall detected: expected sequence ${expectedSeqRef.current} has not arrived for ${now - lastProgressTimeRef.current}ms. Forcing reconnect...`);
          forceReconnect();
          return;
        }

        // Case 3: Connection dead check (no heartbeats or messages for 25s)
        if (timeSinceLastMessage > 25000) {
          console.warn(`[useWebSocket] Connection dead detected: no messages received for ${timeSinceLastMessage}ms. Forcing reconnect...`);
          forceReconnect();
          return;
        }
      }
    }, 1000);

    connect();

    return () => {
      cleanedUpRef.current = true;
      if (throughputIntervalRef.current) {
        clearInterval(throughputIntervalRef.current);
        throughputIntervalRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, forceReconnect]);

  return { status, sendMessage, markRendered, currentSeq, reconnectAttempt, backoffMs, lastPingAt, forceReconnect, disconnect, resetSession, triggerNetworkDrop, metrics };
}

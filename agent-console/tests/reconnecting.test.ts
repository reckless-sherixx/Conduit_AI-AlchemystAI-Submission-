
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useWebSocket } from "../hooks/useWebSocket";
import { renderHook, act } from "@testing-library/react";


class MockWebSocket {
  url: string;
  readyState: number = 0; 
  send = vi.fn();
  close = vi.fn();

  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;

  static instances: MockWebSocket[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
    
    
    setTimeout(() => {
      this.readyState = 1; 
      if (this.onopen) this.onopen();
    }, 0);
  }
}

describe("WebSocket Transport & Reconnection State Recovery", () => {
  beforeEach(() => {
    vi.stubGlobal("WebSocket", MockWebSocket);
    MockWebSocket.instances = [];
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("should trigger connection and send RESUME on reconnect", async () => {
    const onMessageMock = vi.fn();

    const { result } = renderHook(() =>
      useWebSocket({
        url: "ws://localhost:4747/ws",
        onMessage: onMessageMock,
      })
    );

    
    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.status).toBe("connected");
    const first_ws = MockWebSocket.instances[0];
    expect(first_ws).toBeDefined();

    
    act(() => {
      result.current.markRendered(5);
    });

    
    await act(async () => {
      if (first_ws.onclose) {
        first_ws.onclose();
      }
    });

    
    expect(result.current.status).toBe("disconnected");

    
    await act(async () => {
      vi.advanceTimersByTime(510);
    });

    const second_ws = MockWebSocket.instances[1];
    expect(second_ws).toBeDefined();
    
    
    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    
    expect(second_ws.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "RESUME", last_seq: 5 })
    );

    expect(result.current.status).toBe("connected");
  });
});

import type { WsMessage } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export type MessageHandler = (msg: WsMessage) => void;

export class RunWebSocket {
  private ws: WebSocket | null = null;
  private runId: string;
  private handler: MessageHandler;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private closed = false;

  constructor(runId: string, handler: MessageHandler) {
    this.runId = runId;
    this.handler = handler;
  }

  connect(): void {
    if (this.closed) return;

    const url = `${WS_URL}/ws/runs/${this.runId}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log(`[WS] Connected to run ${this.runId}`);
      // Start ping interval
      this.pingTimer = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send("ping");
        }
      }, 30000);
    };

    this.ws.onmessage = (event) => {
      try {
        if (event.data === "pong") return;
        const msg: WsMessage = JSON.parse(event.data);
        this.handler(msg);
      } catch (e) {
        console.error("[WS] Failed to parse message:", e);
      }
    };

    this.ws.onclose = () => {
      console.log(`[WS] Disconnected from run ${this.runId}`);
      this.clearPing();
      if (!this.closed) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (err) => {
      console.error("[WS] Error:", err);
      this.ws?.close();
    };
  }

  private scheduleReconnect(): void {
    this.reconnectTimer = setTimeout(() => {
      console.log(`[WS] Reconnecting to run ${this.runId}...`);
      this.connect();
    }, 2000);
  }

  private clearPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  disconnect(): void {
    this.closed = true;
    this.clearPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

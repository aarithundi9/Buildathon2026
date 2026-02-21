"""WebSocket connection manager for per-run rooms."""
from __future__ import annotations

import json
import logging
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections grouped by run_id."""

    def __init__(self) -> None:
        self.rooms: dict[str, list[WebSocket]] = {}

    async def connect(self, run_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self.rooms.setdefault(run_id, []).append(ws)
        logger.info(f"WS connected: run={run_id} (total={len(self.rooms[run_id])})")

    def disconnect(self, run_id: str, ws: WebSocket) -> None:
        if run_id in self.rooms:
            self.rooms[run_id] = [c for c in self.rooms[run_id] if c is not ws]
            if not self.rooms[run_id]:
                del self.rooms[run_id]
        logger.info(f"WS disconnected: run={run_id}")

    async def broadcast(self, run_id: str, message: dict) -> None:
        """Send a JSON message to all clients subscribed to a run_id."""
        if run_id not in self.rooms:
            return
        payload = json.dumps(message, default=str)
        stale: list[WebSocket] = []
        for ws in self.rooms[run_id]:
            try:
                await ws.send_text(payload)
            except Exception:
                stale.append(ws)
        for ws in stale:
            self.disconnect(run_id, ws)


manager = ConnectionManager()

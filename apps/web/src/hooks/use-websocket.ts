"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RunWebSocket } from "@/lib/websocket";
import { useUpsertStep } from "./use-steps";
import type { Run, WsMessage } from "@/types";

export function useRunWebSocket(runId: string | undefined) {
  const wsRef = useRef<RunWebSocket | null>(null);
  const upsertStep = useUpsertStep();
  const queryClient = useQueryClient();

  const handleMessage = useCallback(
    (msg: WsMessage) => {
      if (msg.type === "step_update") {
        upsertStep(msg.step);
      } else if (msg.type === "run_update") {
        queryClient.setQueryData<Run>(["run", msg.run.run_id], msg.run);
        // Also invalidate the runs list so sidebar updates
        queryClient.invalidateQueries({ queryKey: ["runs"] });
      }
    },
    [upsertStep, queryClient]
  );

  useEffect(() => {
    if (!runId) return;

    const ws = new RunWebSocket(runId, handleMessage);
    ws.connect();
    wsRef.current = ws;

    return () => {
      ws.disconnect();
      wsRef.current = null;
    };
  }, [runId, handleMessage]);

  return wsRef;
}

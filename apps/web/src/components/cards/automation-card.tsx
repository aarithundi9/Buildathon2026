"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { cn, formatDuration, formatTokens, formatCost, shortId, formatTimestamp } from "@/lib/utils";
import type { Run, Step, RunStatus } from "@/types";

interface AutomationCardProps {
  run: Run;
  steps?: Step[];
  index: number;
}

const STATUS_DOT: Record<RunStatus, string> = {
  running: "bg-blue-500",
  completed: "bg-emerald-500",
  failed: "bg-red-500",
};

export function AutomationCard({ run, steps, index }: AutomationCardProps) {
  const router = useRouter();

  const totalDuration =
    steps?.reduce((a, s) => a + (s.duration_ms || 0), 0) ?? 0;
  const totalTokens =
    steps?.reduce(
      (a, s) => a + (s.tokens_prompt || 0) + (s.tokens_completion || 0),
      0
    ) ?? 0;
  const totalCost =
    steps?.reduce((a, s) => a + (s.cost_usd || 0), 0) ?? 0;
  const stepCount = steps?.length ?? 0;

  return (
    <button
      onClick={() => router.push(`/runs/${run.run_id}`)}
      className="group flex flex-col rounded-md border bg-card p-4 text-left transition-colors hover:bg-accent"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              STATUS_DOT[run.status]
            )}
          />
          <span className="text-sm font-medium">{shortId(run.run_id)}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {run.status}
        </span>
      </div>

      {/* Description */}
      <p className="mt-2 text-xs text-muted-foreground">
        {run.system_type}{run.metadata?.tags?.length > 0 ? ` · ${run.metadata.tags[0]}` : ""}
      </p>

      {/* Stats row */}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span>{stepCount} steps</span>
        {totalDuration > 0 && <span>{formatDuration(totalDuration)}</span>}
        {totalTokens > 0 && <span>{formatTokens(totalTokens)} tok</span>}
        {totalCost > 0 && <span>{formatCost(totalCost)}</span>}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <span className="text-[11px] text-muted-foreground">
          {formatTimestamp(run.created_at)}
        </span>
        <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
          View →
        </span>
      </div>
    </button>
  );
}

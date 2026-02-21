"use client";

import React, { useMemo } from "react";
import type { Run, Step } from "@/types";

interface StatsBarProps {
  runs: Run[];
  allSteps: Map<string, Step[]>;
}

export function StatsBar({ runs, allSteps }: StatsBarProps) {
  const stats = useMemo(() => {
    const completed = runs.filter((r) => r.status === "completed").length;
    const running = runs.filter((r) => r.status === "running").length;
    const failed = runs.filter((r) => r.status === "failed").length;

    let totalTokens = 0;
    let totalCost = 0;
    let totalSteps = 0;

    allSteps.forEach((steps) => {
      steps.forEach((s) => {
        totalTokens += (s.tokens_prompt || 0) + (s.tokens_completion || 0);
        totalCost += s.cost_usd || 0;
      });
      totalSteps += steps.length;
    });

    return [
      { label: "Total Runs", value: runs.length.toString(), color: "text-foreground" },
      { label: "Running", value: running.toString(), color: "text-blue-400" },
      { label: "Completed", value: completed.toString(), color: "text-emerald-400" },
      { label: "Failed", value: failed.toString(), color: "text-red-400" },
      { label: "Total Steps", value: totalSteps.toString(), color: "text-foreground" },
      {
        label: "Tokens",
        value: totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : totalTokens.toString(),
        color: "text-[hsl(var(--primary))]",
      },
      {
        label: "Cost",
        value: `$${totalCost.toFixed(3)}`,
        color: "text-foreground",
      },
    ];
  }, [runs, allSteps]);

  return (
    <div className="flex items-center gap-6 rounded-lg border bg-card px-5 py-3 overflow-x-auto">
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          {i > 0 && <div className="h-8 w-px bg-border shrink-0" />}
          <div className="shrink-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

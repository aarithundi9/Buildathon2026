"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import type { Run, Step } from "@/types";

interface MetricsPanelProps {
  runs: Run[];
  allSteps: Map<string, Step[]>;
}

// Mini sparkline component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MetricsPanel({ runs, allSteps }: MetricsPanelProps) {
  const metrics = useMemo(() => {
    const completed = runs.filter((r) => r.status === "completed").length;
    const failed = runs.filter((r) => r.status === "failed").length;
    const total = runs.length || 1;
    const successRate = Math.round((completed / total) * 100);

    let totalTokens = 0;
    let totalCost = 0;
    let totalDuration = 0;
    let stepCount = 0;

    allSteps.forEach((steps) => {
      steps.forEach((s) => {
        totalTokens += (s.tokens_prompt || 0) + (s.tokens_completion || 0);
        totalCost += s.cost_usd || 0;
        totalDuration += s.duration_ms || 0;
        stepCount++;
      });
    });

    const avgDuration = stepCount > 0 ? totalDuration / stepCount : 0;

    return {
      successRate,
      totalRuns: runs.length,
      totalTokens,
      totalCost,
      avgDuration,
      failed,
    };
  }, [runs, allSteps]);

  // Distribution data for the legend
  const distribution = useMemo(() => {
    const types = new Map<string, number>();
    allSteps.forEach((steps) => {
      steps.forEach((s) => {
        types.set(s.type, (types.get(s.type) || 0) + 1);
      });
    });

    const total = Array.from(types.values()).reduce((a, b) => a + b, 0) || 1;
    const colors: Record<string, string> = {
      llm: "hsl(187, 100%, 50%)",
      tool: "hsl(262, 83%, 68%)",
      plan: "hsl(45, 93%, 58%)",
      final: "hsl(142, 71%, 55%)",
      error: "hsl(0, 84%, 60%)",
    };

    return Array.from(types.entries()).map(([type, count]) => ({
      type,
      pct: ((count / total) * 100).toFixed(1),
      color: colors[type] || "hsl(220, 10%, 50%)",
    }));
  }, [allSteps]);

  // Generate sparkline data
  const sparkData = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => 30 + Math.sin(i * 0.5) * 20 + Math.random() * 10);
  }, []);

  return (
    <div className="rounded-lg border bg-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Trace Performance</h3>
        <button className="rounded-md border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          Reorder
        </button>
      </div>

      {/* Distribution legend */}
      <div className="space-y-2.5">
        {distribution.map((d) => (
          <div key={d.type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-xs capitalize">{d.type} Steps</span>
            </div>
            <span className="text-xs text-muted-foreground">{d.pct}%</span>
          </div>
        ))}
      </div>

      <div className="h-px bg-border" />

      {/* Big numbers */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Success Rate</p>
          <p className="text-2xl font-bold tracking-tight">{metrics.successRate}%</p>
          <p className="text-[10px] text-muted-foreground">Batch Complete</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Resolution</p>
          <p className="text-2xl font-bold tracking-tight">{metrics.totalRuns}</p>
          <p className="text-[10px] text-muted-foreground">Runs total</p>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Sparklines section */}
      <div>
        <h4 className="text-xs font-medium mb-3">Trace Metrics</h4>
        <div className="flex items-center gap-4">
          <Sparkline data={sparkData} color="hsl(187, 100%, 50%)" />
          <Sparkline data={sparkData.map((v) => v * 0.7 + 10)} color="hsl(174, 72%, 56%)" />
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Additional metrics */}
      <div>
        <h4 className="text-xs font-medium mb-3">Aggregate Highlights</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Token Usage</span>
            <span>{metrics.totalTokens > 1000 ? `${(metrics.totalTokens / 1000).toFixed(1)}k` : metrics.totalTokens}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Cost</span>
            <span>${metrics.totalCost.toFixed(4)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Failed Runs</span>
            <span className="text-red-400">{metrics.failed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

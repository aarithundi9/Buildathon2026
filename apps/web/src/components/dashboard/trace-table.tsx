"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { cn, shortId, formatDuration, formatTokens, formatCost, formatTimestamp } from "@/lib/utils";
import type { Run, Step } from "@/types";

interface TraceTableProps {
  runs: Run[];
  allSteps: Map<string, Step[]>;
}

function MiniSparkline({ data }: { data: number[] }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="h-12 w-28">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke="hsl(187, 100%, 50%)"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  running: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function TraceTable({ runs, allSteps }: TraceTableProps) {
  const router = useRouter();

  const tableRows = useMemo(() => {
    return runs.slice(0, 10).map((run) => {
      const steps = allSteps.get(run.run_id) || [];
      const totalDuration = steps.reduce((a, s) => a + (s.duration_ms || 0), 0);
      const totalTokens = steps.reduce(
        (a, s) => a + (s.tokens_prompt || 0) + (s.tokens_completion || 0),
        0
      );
      const totalCost = steps.reduce((a, s) => a + (s.cost_usd || 0), 0);

      // Generate sparkline data from step durations
      const sparkData = steps.length > 0
        ? steps.map((s) => s.duration_ms || 0)
        : Array.from({ length: 8 }, () => Math.random() * 60 + 20);

      return {
        run,
        steps: steps.length,
        totalDuration,
        totalTokens,
        totalCost,
        sparkData,
      };
    });
  }, [runs, allSteps]);

  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h3 className="text-sm font-medium">Trace Runs</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Trace observability for agent execution platform
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="py-3 px-5 text-left font-medium">Trend</th>
              <th className="py-3 px-5 text-left font-medium">Run/Metrics</th>
              <th className="py-3 px-5 text-left font-medium">Duration</th>
              <th className="py-3 px-5 text-left font-medium">Cost</th>
              <th className="py-3 px-5 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map(({ run, steps, totalDuration, totalTokens, totalCost, sparkData }) => (
              <tr
                key={run.run_id}
                onClick={() => router.push(`/runs/${run.run_id}`)}
                className="border-b last:border-0 cursor-pointer hover:bg-accent/50 transition-colors"
              >
                {/* Sparkline */}
                <td className="py-3 px-5">
                  <MiniSparkline data={sparkData} />
                </td>

                {/* Run info */}
                <td className="py-3 px-5">
                  <div className="font-medium text-sm text-[hsl(var(--primary))]">
                    {shortId(run.run_id)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {steps} steps · {run.system_type}
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div>
                      <span className="text-lg font-bold">
                        {totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : totalTokens}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1">tokens</span>
                    </div>
                  </div>
                </td>

                {/* Duration */}
                <td className="py-3 px-5">
                  <span className="text-lg font-bold">
                    {totalDuration > 0 ? formatDuration(totalDuration) : "—"}
                  </span>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {formatTimestamp(run.created_at)}
                  </div>
                </td>

                {/* Cost */}
                <td className="py-3 px-5">
                  <span className="text-lg font-bold">
                    {totalCost > 0 ? formatCost(totalCost) : "—"}
                  </span>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    USD
                  </div>
                </td>

                {/* Status */}
                <td className="py-3 px-5">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
                      STATUS_STYLES[run.status] || "bg-secondary text-foreground"
                    )}
                  >
                    {run.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tableRows.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No trace runs yet. Click &quot;New run&quot; to get started.
          </div>
        )}
      </div>
    </div>
  );
}

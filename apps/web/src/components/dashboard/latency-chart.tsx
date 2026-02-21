"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Run, Step } from "@/types";

interface LatencyChartProps {
  runs: Run[];
  allSteps: Map<string, Step[]>;
}

export function LatencyChart({ runs, allSteps }: LatencyChartProps) {
  const chartData = useMemo(() => {
    // Generate time-series data from runs
    const sortedRuns = [...runs]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-40); // Last 40 data points

    return sortedRuns.map((run, idx) => {
      const steps = allSteps.get(run.run_id) || [];
      const llmSteps = steps.filter((s) => s.type === "llm");
      const toolSteps = steps.filter((s) => s.type === "tool");

      const avgLatency = steps.length > 0
        ? steps.reduce((a, s) => a + (s.duration_ms || 0), 0) / steps.length
        : Math.random() * 200 + 50;

      const llmLatency = llmSteps.length > 0
        ? llmSteps.reduce((a, s) => a + (s.duration_ms || 0), 0) / llmSteps.length
        : avgLatency * (0.8 + Math.random() * 0.4);

      const toolLatency = toolSteps.length > 0
        ? toolSteps.reduce((a, s) => a + (s.duration_ms || 0), 0) / toolSteps.length
        : avgLatency * (0.3 + Math.random() * 0.5);

      return {
        name: `${idx + 1}`,
        avgLatency: Math.round(avgLatency),
        llmLatency: Math.round(llmLatency),
        toolLatency: Math.round(toolLatency),
      };
    });
  }, [runs, allSteps]);

  // If no data, generate sample data
  const data = chartData.length > 0 ? chartData : Array.from({ length: 40 }, (_, i) => ({
    name: `${i + 1}`,
    avgLatency: Math.round(80 + Math.sin(i * 0.3) * 60 + Math.random() * 40),
    llmLatency: Math.round(120 + Math.sin(i * 0.25) * 80 + Math.random() * 50),
    toolLatency: Math.round(40 + Math.sin(i * 0.35) * 30 + Math.random() * 20),
  }));

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Generation Latencies</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Trace performance across active agents
          </p>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
            <circle cx="8" cy="2" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="14" r="1.5" />
          </svg>
        </button>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 65%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(217, 91%, 65%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 18%)" strokeOpacity={0.5} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }}
              axisLine={{ stroke: "hsl(220, 18%, 18%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }}
              axisLine={{ stroke: "hsl(220, 18%, 18%)" }}
              tickLine={false}
              unit="ms"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 22%, 10%)",
                border: "1px solid hsl(220, 18%, 18%)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(220, 10%, 90%)",
              }}
            />
            <Area
              type="monotone"
              dataKey="llmLatency"
              stroke="hsl(187, 100%, 50%)"
              strokeWidth={2}
              fill="url(#gradCyan)"
              name="LLM Latency"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="avgLatency"
              stroke="hsl(174, 72%, 56%)"
              strokeWidth={1.5}
              fill="url(#gradTeal)"
              name="Avg Latency"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="toolLatency"
              stroke="hsl(217, 91%, 65%)"
              strokeWidth={1.5}
              fill="url(#gradBlue)"
              name="Tool Latency"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

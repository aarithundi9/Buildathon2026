"use client";

import { useState, useMemo, useEffect } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { LatencyChart } from "@/components/dashboard/latency-chart";
import { MetricsPanel } from "@/components/dashboard/metrics-panel";
import { TraceTable } from "@/components/dashboard/trace-table";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { useRuns } from "@/hooks/use-runs";
import { getRunSteps } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import type { Step } from "@/types";

export default function DashboardPage() {
  const { data: runs, isLoading } = useRuns();
  const [allSteps, setAllSteps] = useState<Map<string, Step[]>>(new Map());

  // Fetch steps for all runs
  useEffect(() => {
    if (!runs || runs.length === 0) return;

    const fetchSteps = async () => {
      const newMap = new Map<string, Step[]>();
      await Promise.all(
        runs.slice(0, 20).map(async (run) => {
          try {
            const steps = await getRunSteps(run.run_id);
            newMap.set(run.run_id, steps);
          } catch {
            newMap.set(run.run_id, []);
          }
        })
      );
      setAllSteps(newMap);
    };

    fetchSteps();
  }, [runs]);

  const currentRuns = runs ?? [];

  return (
    <>
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopNav />

        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading ? (
            <div className="space-y-5">
              <Skeleton className="h-16 rounded-lg" />
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
                <Skeleton className="h-[380px] rounded-lg" />
                <Skeleton className="h-[380px] rounded-lg" />
              </div>
              <Skeleton className="h-[300px] rounded-lg" />
            </div>
          ) : (
            <>
              {/* Stats bar */}
              <StatsBar runs={currentRuns} allSteps={allSteps} />

              {/* Chart + Metrics panel */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
                <LatencyChart runs={currentRuns} allSteps={allSteps} />
                <MetricsPanel runs={currentRuns} allSteps={allSteps} />
              </div>

              {/* Trace runs table */}
              <TraceTable runs={currentRuns} allSteps={allSteps} />
            </>
          )}
        </main>
      </div>
    </>
  );
}

"use client";

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Hash,
  Coins,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExecutionGraph } from "@/components/graph/execution-graph";
import { StepInspector } from "@/components/inspector/step-inspector";
import { RunExplorer } from "@/components/explorer/run-explorer";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useRun } from "@/hooks/use-runs";
import { useSteps } from "@/hooks/use-steps";
import { useRunWebSocket } from "@/hooks/use-websocket";
import { cn, shortId, formatDuration, formatTokens, formatCost } from "@/lib/utils";
import type { Step } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  running: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function RunPage() {
  const router = useRouter();
  const params = useParams();
  const runId = params.runId as string;

  const { data: run, isLoading: runLoading } = useRun(runId);
  const { data: steps, isLoading: stepsLoading } = useSteps(runId);
  useRunWebSocket(runId);

  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const handleStepClick = useCallback((step: Step) => {
    setSelectedStep(step);
    setInspectorOpen(true);
  }, []);

  const isLoading = runLoading || stepsLoading;
  const currentSteps = steps ?? [];

  const totalDuration = currentSteps.reduce((a, s) => a + (s.duration_ms || 0), 0);
  const totalTokens = currentSteps.reduce(
    (a, s) => a + (s.tokens_prompt || 0) + (s.tokens_completion || 0),
    0
  );
  const totalCost = currentSteps.reduce((a, s) => a + (s.cost_usd || 0), 0);

  return (
    <>
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0 bg-background">
        {/* Header */}
        <header className="flex items-center justify-between border-b px-5 py-3 bg-card/50">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {runLoading ? (
              <Skeleton className="h-5 w-40" />
            ) : run ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{shortId(run.run_id)}</span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
                    STATUS_STYLES[run.status] || "bg-secondary text-foreground"
                  )}
                >
                  {run.status}
                </span>
                <span className="text-xs text-muted-foreground">{run.system_type}</span>
              </div>
            ) : null}
          </div>

          <div className="hidden items-center gap-5 md:flex">
            {/* Stat pills */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              <span>{currentSteps.length} steps</span>
            </div>
            {totalDuration > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDuration(totalDuration)}</span>
              </div>
            )}
            {totalTokens > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                <span>{formatTokens(totalTokens)} tokens</span>
              </div>
            )}
            {totalCost > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Coins className="h-3.5 w-3.5" />
                <span>{formatCost(totalCost)}</span>
              </div>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="trace" className="flex flex-1 flex-col min-h-0">
          <div className="border-b px-5 bg-card/30">
            <TabsList className="h-10 bg-transparent p-0 gap-0">
              <TabsTrigger
                value="trace"
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-xs data-[state=active]:border-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary))] data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Trace
              </TabsTrigger>
              <TabsTrigger
                value="explorer"
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-xs data-[state=active]:border-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary))] data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Table
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trace" className="flex-1 m-0 min-h-0">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <ExecutionGraph
                steps={currentSteps}
                onNodeClick={handleStepClick}
                selectedStepId={selectedStep?.step_id}
              />
            )}
          </TabsContent>

          <TabsContent value="explorer" className="flex-1 m-0 min-h-0">
            <RunExplorer
              steps={currentSteps}
              onStepClick={handleStepClick}
              selectedStepId={selectedStep?.step_id}
            />
          </TabsContent>
        </Tabs>

        <StepInspector
          step={selectedStep}
          open={inspectorOpen}
          onOpenChange={setInspectorOpen}
        />
      </div>
    </>
  );
}

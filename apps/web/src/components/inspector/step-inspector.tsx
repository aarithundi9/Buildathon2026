"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  Hash,
  Coins,
  Copy,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn, formatDuration, formatTokens, formatCost, formatTimestamp } from "@/lib/utils";
import type { Step } from "@/types";

interface StepInspectorProps {
  step: Step | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copy}>
      {copied ? (
        <Check className="h-3 w-3 text-green-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
}

function JsonBlock({ label, data }: { label: string; data: unknown }) {
  const [expanded, setExpanded] = useState(true);
  const json = JSON.stringify(data, null, 2);
  const isEmpty =
    data === null ||
    data === undefined ||
    (typeof data === "object" && Object.keys(data as object).length === 0);

  if (isEmpty) return null;

  return (
    <div className="space-y-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {label}
      </button>
      {expanded && (
        <div className="relative">
          <div className="absolute right-2 top-2">
            <CopyButton text={json} />
          </div>
          <pre className="rounded-md bg-muted/50 p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
            {json}
          </pre>
        </div>
      )}
    </div>
  );
}

export function StepInspector({ step, open, onOpenChange }: StepInspectorProps) {
  if (!step) return null;

  const totalTokens = step.tokens_prompt + step.tokens_completion;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-base">{step.name}</SheetTitle>
          </div>
          <SheetDescription className="flex items-center gap-2">
            <Badge
              variant={step.type as "llm" | "tool" | "plan" | "final" | "error"}
            >
              {step.type}
            </Badge>
            <Badge
              variant={step.status as "running" | "completed" | "failed" | "retrying"}
            >
              {step.status}
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-5">
            {/* Summary metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={Clock}
                label="Duration"
                value={formatDuration(step.duration_ms)}
              />
              <MetricCard
                icon={Hash}
                label="Total Tokens"
                value={formatTokens(totalTokens)}
              />
              <MetricCard
                icon={Coins}
                label="Cost"
                value={formatCost(step.cost_usd)}
              />
              <MetricCard
                icon={Clock}
                label="Started"
                value={formatTimestamp(step.started_at)}
              />
            </div>

            {/* Token breakdown */}
            {totalTokens > 0 && (
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Token Breakdown
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Prompt: </span>
                    <span className="font-medium">
                      {formatTokens(step.tokens_prompt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Completion: </span>
                    <span className="font-medium">
                      {formatTokens(step.tokens_completion)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* LLM-specific: Prompt & Completion */}
            {step.type === "llm" && (
              <>
                {step.input?.prompt && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Prompt
                    </p>
                    <div className="relative">
                      <div className="absolute right-2 top-2">
                        <CopyButton text={String(step.input.prompt)} />
                      </div>
                      <div className="rounded-md bg-blue-500/5 border border-blue-500/20 p-3 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {String(step.input.prompt)}
                      </div>
                    </div>
                  </div>
                )}
                {step.output?.completion && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Completion
                    </p>
                    <div className="relative">
                      <div className="absolute right-2 top-2">
                        <CopyButton text={String(step.output.completion)} />
                      </div>
                      <div className="rounded-md bg-green-500/5 border border-green-500/20 p-3 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {String(step.output.completion)}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Tool-specific */}
            {step.type === "tool" && (
              <>
                {step.input?.tool && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Tool Name
                    </p>
                    <code className="rounded bg-purple-500/10 px-2 py-1 text-sm text-purple-400">
                      {String(step.input.tool)}
                    </code>
                  </div>
                )}
                {step.input?.args && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Arguments
                    </p>
                    <div className="relative">
                      <div className="absolute right-2 top-2">
                        <CopyButton
                          text={JSON.stringify(step.input.args, null, 2)}
                        />
                      </div>
                      <pre className="rounded-md bg-purple-500/5 border border-purple-500/20 p-3 text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto">
                        {JSON.stringify(step.input.args, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Error details */}
            {step.error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 space-y-2">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Error</span>
                  {step.error.code && (
                    <Badge variant="destructive" className="text-[10px]">
                      {step.error.code}
                    </Badge>
                  )}
                </div>
                <p className="text-sm">{step.error.message}</p>
                {step.error.stack && (
                  <pre className="mt-2 rounded bg-red-500/10 p-2 text-xs font-mono text-red-300 overflow-x-auto max-h-32 overflow-y-auto">
                    {step.error.stack}
                  </pre>
                )}
              </div>
            )}

            <Separator />

            {/* Raw Input/Output JSON */}
            <JsonBlock label="Raw Input" data={step.input} />
            <JsonBlock label="Raw Output" data={step.output} />

            {/* Timestamps */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Timestamps
              </p>
              <div className="rounded-md bg-muted/30 p-3 text-xs font-mono space-y-1">
                <div>
                  <span className="text-muted-foreground">step_id:    </span>
                  {step.step_id}
                </div>
                <div>
                  <span className="text-muted-foreground">run_id:     </span>
                  {step.run_id}
                </div>
                {step.parent_step_id && (
                  <div>
                    <span className="text-muted-foreground">parent_id:  </span>
                    {step.parent_step_id}
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">started_at: </span>
                  {step.started_at}
                </div>
                {step.ended_at && (
                  <div>
                    <span className="text-muted-foreground">ended_at:   </span>
                    {step.ended_at}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border bg-muted/30 p-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

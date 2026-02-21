"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { cn, formatDuration, formatTokens } from "@/lib/utils";
import type { Step, StepType, StepStatus } from "@/types";

const TYPE_COLORS: Record<StepType, { dot: string; border: string }> = {
  llm: { dot: "bg-[hsl(187,100%,50%)]", border: "border-[hsl(187,100%,50%)]/30" },
  tool: { dot: "bg-[hsl(262,83%,68%)]", border: "border-[hsl(262,83%,68%)]/30" },
  plan: { dot: "bg-[hsl(45,93%,58%)]", border: "border-[hsl(45,93%,58%)]/30" },
  final: { dot: "bg-[hsl(142,71%,55%)]", border: "border-[hsl(142,71%,55%)]/30" },
  error: { dot: "bg-red-500", border: "border-red-500/30" },
};

const STATUS_DOT: Record<StepStatus, string> = {
  running: "animate-pulse bg-blue-400",
  completed: "bg-emerald-400",
  failed: "bg-red-400",
  retrying: "animate-pulse bg-amber-400",
};

function StepNodeComponent({ data, selected }: NodeProps<Step>) {
  const step = data;
  const totalTokens = step.tokens_prompt + step.tokens_completion;
  const colors = TYPE_COLORS[step.type] || { dot: "bg-gray-400", border: "border-gray-500/30" };

  return (
    <div
      className={cn(
        "node-animate-in rounded-lg border bg-card cursor-pointer min-w-[240px] transition-all",
        colors.border,
        selected && "ring-1 ring-[hsl(var(--primary))] border-[hsl(var(--primary))]/50",
        "hover:border-[hsl(var(--primary))]/40"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[hsl(var(--primary))] !w-2 !h-2 !border-0 !opacity-50"
      />

      <div className="px-3.5 py-2.5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn("inline-block h-2.5 w-2.5 rounded-full shrink-0", colors.dot)} />
            <span className="text-xs font-medium truncate">{step.name}</span>
          </div>
          <span className={cn("inline-block h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT[step.status])} />
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
          <span className="uppercase text-[10px] font-medium text-[hsl(var(--primary))]/70">{step.type}</span>
          <span className="text-border">|</span>
          <span>{step.status}</span>
          {step.duration_ms > 0 && (
            <>
              <span className="text-border">|</span>
              <span>{formatDuration(step.duration_ms)}</span>
            </>
          )}
          {totalTokens > 0 && (
            <>
              <span className="text-border">|</span>
              <span>{formatTokens(totalTokens)} tok</span>
            </>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[hsl(var(--primary))] !w-2 !h-2 !border-0 !opacity-50"
      />
    </div>
  );
}

export const StepNode = memo(StepNodeComponent);

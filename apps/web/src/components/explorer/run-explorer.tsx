"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Activity } from "lucide-react";
import { cn, formatDuration, formatTokens, formatCost, formatTimestamp } from "@/lib/utils";
import type { Step, StepType, StepStatus } from "@/types";

interface RunExplorerProps {
  steps: Step[];
  onStepClick?: (step: Step) => void;
  selectedStepId?: string;
}

export function RunExplorer({
  steps,
  onStepClick,
  selectedStepId,
}: RunExplorerProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return steps.filter((step) => {
      const matchesSearch =
        !search ||
        step.name.toLowerCase().includes(search.toLowerCase()) ||
        step.step_id.includes(search);
      const matchesType = typeFilter === "all" || step.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || step.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [steps, search, typeFilter, statusFilter]);

  if (steps.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            No steps recorded
          </p>
          <p className="text-sm text-muted-foreground/60">
            Steps will appear here as the agent executes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Filters */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search steps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="llm">LLM</SelectItem>
            <SelectItem value="tool">Tool</SelectItem>
            <SelectItem value="plan">Plan</SelectItem>
            <SelectItem value="final">Final</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="retrying">Retrying</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">
          {filtered.length} of {steps.length} steps
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Name</TableHead>
              <TableHead className="w-[80px]">Type</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[90px] text-right">Duration</TableHead>
              <TableHead className="w-[100px] text-right">Tokens</TableHead>
              <TableHead className="w-[80px] text-right">Cost</TableHead>
              <TableHead className="w-[100px]">Started</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((step) => (
              <TableRow
                key={step.step_id}
                onClick={() => onStepClick?.(step)}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedStepId === step.step_id && "bg-accent"
                )}
              >
                <TableCell className="font-medium">
                  <span className="truncate block max-w-[200px]">
                    {step.name}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={step.type as "llm" | "tool" | "plan" | "final" | "error"}
                    className="text-[10px]"
                  >
                    {step.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={step.status as "running" | "completed" | "failed" | "retrying"}
                    className={cn(
                      "text-[10px]",
                      step.status === "running" && "animate-pulse"
                    )}
                  >
                    {step.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {step.duration_ms > 0 ? formatDuration(step.duration_ms) : "—"}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {step.tokens_prompt + step.tokens_completion > 0
                    ? formatTokens(step.tokens_prompt + step.tokens_completion)
                    : "—"}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {step.cost_usd > 0 ? formatCost(step.cost_usd) : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatTimestamp(step.started_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

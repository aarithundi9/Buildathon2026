"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useScenarios, useCreateRun } from "@/hooks/use-runs";

const NAV_LINKS = [
  { label: "Observability", active: true },
  { label: "Recents", active: false },
  { label: "Deployments", active: false },
  { label: "Guard Overview", active: false },
];

export function TopNav() {
  const router = useRouter();
  const { data: scenariosData } = useScenarios();
  const createRun = useCreateRun();
  const scenarios = scenariosData?.scenarios ?? [];

  const handleStartDemo = async (scenarioId: string) => {
    try {
      const run = await createRun.mutateAsync({
        system_type: "mock",
        scenario: scenarioId,
      });
      router.push(`/runs/${run.run_id}`);
    } catch (e) {
      console.error("Failed to create run:", e);
    }
  };

  return (
    <header className="flex h-12 items-center justify-between border-b px-5 bg-card/50">
      {/* Left: branding + nav links */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="text-[hsl(var(--primary))]">⬡</span>
          <span>Enterprise SaaS</span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              className={`px-3 py-1.5 text-[13px] rounded-md transition-colors ${
                link.active
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Right: search, new run, notifications, avatar */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="flex h-8 items-center gap-2 rounded-md border bg-secondary/50 px-3 text-xs text-muted-foreground hover:bg-secondary transition-colors">
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono sm:inline">⌘K</kbd>
        </button>

        <ThemeToggle />

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[9px] font-bold text-[hsl(var(--primary-foreground))]">
            14
          </span>
        </button>

        {/* New Run Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
              disabled={createRun.isPending}
            >
              {createRun.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Starting…
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  New run
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Select scenario
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {scenarios.map((s) => (
              <DropdownMenuItem
                key={s.id}
                onClick={() => handleStartDemo(s.id)}
                className="text-xs"
              >
                {s.label}
              </DropdownMenuItem>
            ))}
            {scenarios.length === 0 && (
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                No scenarios available
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Avatar */}
        <div className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-[10px] font-bold text-white cursor-pointer">
          S
        </div>
      </div>
    </header>
  );
}

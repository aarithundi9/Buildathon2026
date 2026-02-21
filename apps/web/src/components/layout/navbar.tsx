"use client";

import { useRouter } from "next/navigation";
import {
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

export function Navbar() {
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
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <button
          onClick={() => router.push("/")}
          className="text-sm font-semibold tracking-tight hover:opacity-70 transition-opacity"
        >
          UAOP
        </button>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
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
                    <ChevronDown className="h-3 w-3 opacity-50" />
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
                  className="cursor-pointer text-sm"
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

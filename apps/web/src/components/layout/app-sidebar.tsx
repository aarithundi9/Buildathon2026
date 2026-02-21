"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Search,
  Settings,
  BarChart3,
  Shield,
  Globe,
  Bot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Activity, label: "Observability", href: "/", active: true },
  { icon: Search, label: "Search", href: "/" },
  { icon: Bot, label: "Agents", href: "/" },
  { icon: BarChart3, label: "Analytics", href: "/" },
  { icon: Globe, label: "Deployments", href: "/" },
  { icon: Shield, label: "Guard Rails", href: "/" },
];

const BOTTOM_ITEMS = [
  { icon: Settings, label: "Settings", href: "/" },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[52px] flex-col items-center border-r bg-[hsl(var(--sidebar-bg))] py-3 shrink-0">
      {/* Logo */}
      <button
        onClick={() => router.push("/")}
        className="mb-6 flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </button>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.active || pathname === item.href;
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              title={item.label}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                isActive
                  ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                  : "text-[hsl(var(--sidebar-fg))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
            </button>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="flex flex-col items-center gap-1">
        {BOTTOM_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.href)}
            title={item.label}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[hsl(var(--sidebar-fg))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <item.icon className="h-[18px] w-[18px]" />
          </button>
        ))}

        {/* Avatar */}
        <div className="mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--chart-cyan))] to-[hsl(var(--chart-purple))] text-[10px] font-bold text-white">
          U
        </div>
      </div>
    </aside>
  );
}

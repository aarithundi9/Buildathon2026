import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        outline: "border text-muted-foreground",
        running: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
        completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
        failed: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
        retrying: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
        llm: "bg-secondary text-secondary-foreground",
        tool: "bg-secondary text-secondary-foreground",
        plan: "bg-secondary text-secondary-foreground",
        final: "bg-secondary text-secondary-foreground",
        error: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

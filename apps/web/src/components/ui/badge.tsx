import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-lighter text-muted-foreground border-border",
  primary: "bg-primary-500/12 text-primary-800 border-primary-500/35",
  success: "bg-emerald-500/12 text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/12 text-amber-400 border-amber-500/30",
  danger: "bg-red-500/12 text-red-400 border-red-500/30",
  info: "bg-sky-500/12 text-sky-400 border-sky-500/30",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

type StatusVariant = "online" | "busy" | "offline" | "warning";

interface StatusIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  status?: StatusVariant;
  pulse?: boolean;
}

const statusStyles: Record<StatusVariant, string> = {
  online: "bg-success",
  busy: "bg-danger",
  offline: "bg-slate-500",
  warning: "bg-warning",
};

export function StatusIndicator({
  status = "online",
  pulse = true,
  className,
  ...props
}: StatusIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex h-2.5 w-2.5 rounded-full",
        statusStyles[status],
        pulse && "animate-pulse",
        className
      )}
      aria-label={`status-${status}`}
      {...props}
    />
  );
}

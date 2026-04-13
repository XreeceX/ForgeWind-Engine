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
  default: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  primary: "bg-primary-500/10 text-primary-400 border-primary-500/20",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
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

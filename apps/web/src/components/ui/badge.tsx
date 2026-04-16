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
  default: "bg-slate-100 text-slate-600 border-slate-200",
  primary: "bg-violet-50 text-violet-600 border-violet-200",
  success: "bg-emerald-50 text-emerald-600 border-emerald-200",
  warning: "bg-amber-50 text-amber-600 border-amber-200",
  danger: "bg-red-50 text-red-600 border-red-200",
  info: "bg-sky-50 text-sky-600 border-sky-200",
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

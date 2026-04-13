import { cn } from "@/lib/cn";

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: "primary" | "accent" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantBg: Record<string, string> = {
  primary: "bg-primary-500",
  accent: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

const sizeHeight: Record<string, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function Progress({
  value,
  max = 100,
  label,
  showValue = true,
  variant = "primary",
  size = "md",
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-slate-300">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-slate-200">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-surface-lighter",
          sizeHeight[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            variantBg[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

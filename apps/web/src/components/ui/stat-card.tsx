import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card } from "./card";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    positive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, trend, icon, className }: StatCardProps) {
  return (
    <Card className={cn("p-5", className)} hover>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.positive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-emerald-400" : "text-red-400"
                )}
              >
                {trend.positive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-slate-500">vs last week</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

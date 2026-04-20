"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
  colorClass?: string;
}

export function ScoreRing({
  score,
  maxScore = 100,
  size = 120,
  strokeWidth = 8,
  label,
  className,
  colorClass,
}: ScoreRingProps) {
  const [animated, setAnimated] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(score / maxScore, 1);
  const offset = circumference - percentage * circumference;

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const scoreColor =
    colorClass ??
    (percentage >= 0.8
      ? "text-emerald-400"
      : percentage >= 0.6
        ? "text-primary-400"
        : percentage >= 0.4
          ? "text-amber-400"
          : "text-red-400");

  const strokeColor =
    colorClass ??
    (percentage >= 0.8
      ? "stroke-emerald-400"
      : percentage >= 0.6
        ? "stroke-primary-400"
        : percentage >= 0.4
          ? "stroke-amber-400"
          : "stroke-red-400");

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-lighter"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? offset : circumference}
          className={cn("transition-[stroke-dashoffset] duration-[1.5s] ease-out", strokeColor)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-bold", scoreColor)}>
          {score}
        </span>
        {label && (
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

function healthColor(score: number) {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

export function HealthRing({
  score,
  size = 64,
  className,
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const r = 26;
  const stroke = 6;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, score));
  const targetOffset = c - (clamped / 100) * c;
  const [offset, setOffset] = useState(c);
  const [display, setDisplay] = useState(0);
  const color = healthColor(score);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setOffset(targetOffset);
      setDisplay(score);
      return;
    }

    setOffset(c);
    setDisplay(0);
    const t0 = performance.now();
    const dur = 800;

    let id: number;
    function step(now: number) {
      const t = Math.min(1, (now - t0) / dur);
      const ease = 1 - (1 - t) ** 3;
      setOffset(c - ease * (c - targetOffset));
      setDisplay(Math.round(ease * score));
      if (t < 1) id = requestAnimationFrame(step);
    }
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [score, c, targetOffset]);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-label={`Health score ${score}`}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#E7E5E4"
        strokeWidth={stroke}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        className="font-mono text-[14px] font-medium"
        fill={color}
      >
        {display}
      </text>
    </svg>
  );
}

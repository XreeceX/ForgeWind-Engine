"use client";

import { motion, useReducedMotion } from "framer-motion";

interface AimlMotionFieldProps {
  /** "shell" = dashboard/auth; "cinematic" = full-bleed hero */
  variant?: "shell" | "cinematic";
  className?: string;
}

const nodeSets: Record<
  "shell" | "cinematic",
  Array<{ cx: number; cy: number; r: number; delay: number }>
> = {
  shell: [
    { cx: 12, cy: 22, r: 1.2, delay: 0 },
    { cx: 28, cy: 18, r: 0.9, delay: 0.2 },
    { cx: 44, cy: 28, r: 1.1, delay: 0.4 },
    { cx: 62, cy: 14, r: 0.85, delay: 0.15 },
    { cx: 78, cy: 24, r: 1, delay: 0.35 },
    { cx: 88, cy: 38, r: 0.75, delay: 0.5 },
    { cx: 52, cy: 42, r: 0.95, delay: 0.25 },
  ],
  cinematic: [
    { cx: 8, cy: 30, r: 1.4, delay: 0 },
    { cx: 22, cy: 12, r: 1, delay: 0.18 },
    { cx: 38, cy: 36, r: 1.2, delay: 0.32 },
    { cx: 55, cy: 16, r: 0.9, delay: 0.08 },
    { cx: 72, cy: 40, r: 1.15, delay: 0.42 },
    { cx: 90, cy: 22, r: 1, delay: 0.22 },
    { cx: 48, cy: 8, r: 0.8, delay: 0.55 },
    { cx: 65, cy: 52, r: 0.85, delay: 0.28 },
  ],
};

const edges: Record<"shell" | "cinematic", Array<[number, number, number, number]>> = {
  shell: [
    [12, 22, 28, 18],
    [28, 18, 44, 28],
    [44, 28, 62, 14],
    [62, 14, 78, 24],
    [78, 24, 88, 38],
    [52, 42, 44, 28],
    [28, 18, 52, 42],
  ],
  cinematic: [
    [8, 30, 22, 12],
    [22, 12, 38, 36],
    [38, 36, 55, 16],
    [55, 16, 72, 40],
    [72, 40, 90, 22],
    [48, 8, 55, 16],
    [65, 52, 72, 40],
  ],
};

export function AimlMotionField({ variant = "shell", className = "" }: AimlMotionFieldProps) {
  const reduce = useReducedMotion();
  const nodes = nodeSets[variant];
  const lines = edges[variant];

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="aiml-scanline absolute inset-0 opacity-40" />
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full text-primary-500/25"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
      >
        {lines.map(([x1, y1, x2, y2], i) => (
          <motion.line
            key={`${x1}-${y1}-${x2}-${y2}-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={0.35}
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: reduce ? 0.35 : 0.18 }}
            animate={
              reduce
                ? { opacity: 0.35 }
                : {
                    opacity: [0.12, 0.42, 0.12],
                  }
            }
            transition={
              reduce
                ? { duration: 0 }
                : {
                    duration: 5.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.25,
                  }
            }
          />
        ))}
        {nodes.map((n) => (
          <motion.circle
            key={`${n.cx}-${n.cy}`}
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            fill="currentColor"
            animate={
              reduce
                ? { opacity: 0.35 }
                : { opacity: [0.25, 0.65, 0.25], scale: [1, 1.15, 1] }
            }
            transition={
              reduce
                ? { duration: 0 }
                : {
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: n.delay,
                  }
            }
          />
        ))}
      </svg>
    </div>
  );
}

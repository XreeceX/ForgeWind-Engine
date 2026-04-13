"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface AIFlowVisualizationProps {
  stageLabel: string;
  points: string[];
  className?: string;
}

export function AIFlowVisualization({ stageLabel, points, className }: AIFlowVisualizationProps) {
  return (
    <div className={cn("relative h-full min-h-[320px] overflow-hidden rounded-2xl border border-border-light/70 p-4", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
      <div className="absolute left-5 top-5 text-xs uppercase tracking-[0.2em] text-primary-300">{stageLabel}</div>

      <div className="relative mt-10 space-y-4">
        {points.map((point, index) => (
          <div key={point} className="relative pl-8">
            <motion.span
              className="absolute left-0 top-1 h-3 w-3 rounded-full bg-primary-400 shadow-glow-primary"
              animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.25 }}
            />
            {index < points.length - 1 ? (
              <motion.span
                className="absolute left-[5px] top-4 h-10 w-px bg-primary-400/40"
                animate={{ opacity: [0.25, 0.75, 0.25] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: index * 0.2 }}
              />
            ) : null}
            <motion.p
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.12 }}
              className="text-sm text-slate-200"
            >
              {point}
            </motion.p>
          </div>
        ))}
      </div>
    </div>
  );
}

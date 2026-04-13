"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface FloatingCardProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}

export function FloatingCard({ className, children, delay = 0 }: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "cinematic-card rounded-2xl border border-border-light/70 p-4 shadow-lg [transform-style:preserve-3d]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "w-full max-w-[420px] border border-border bg-panel/85 px-8 py-9 shadow-sm backdrop-blur-xl sm:px-10",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

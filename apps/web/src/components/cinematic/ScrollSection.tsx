"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface ScrollSectionProps {
  id: string;
  label: string;
  title: string;
  description: string;
  active?: boolean;
  children: React.ReactNode;
}

export function ScrollSection({
  id,
  label,
  title,
  description,
  active = false,
  children,
}: ScrollSectionProps) {
  return (
    <section id={id} data-section={id} className="relative h-[150vh]">
      <div className="sticky top-0 flex h-screen items-center px-6 py-10 md:px-12">
        <motion.div
          initial={{ opacity: 0.5, y: 32 }}
          animate={{ opacity: active ? 1 : 0.45, y: active ? 0 : 12 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "mx-auto grid w-full max-w-7xl gap-8 rounded-3xl border border-border-light/70 bg-panel/50 p-6 backdrop-blur-xl md:grid-cols-[1.1fr_1fr] md:p-10",
            active && "shadow-glow-primary",
          )}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary-300">{label}</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-5xl">{title}</h2>
            <p className="mt-5 max-w-xl text-base text-slate-300 md:text-lg">{description}</p>
          </div>
          <div className="relative min-h-[320px]">{children}</div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ForgeWindLogo } from "@/components/brand/forgewind-logo";

export function ForgeWindAuthMark() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8 text-center"
    >
      <Link href="/" className="group inline-flex flex-col items-center gap-4">
        <div className="overflow-hidden border border-border bg-panel shadow-sm ring-1 ring-border/60">
          <ForgeWindLogo size={72} priority className="bg-surface-light" />
        </div>
        <div>
          <span className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Forge<span className="gradient-text">Wind</span>
          </span>
          <p className="mt-2 text-xs uppercase tracking-[0.28em] text-muted-foreground transition-colors group-hover:text-primary-600">
            AIML career intelligence
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

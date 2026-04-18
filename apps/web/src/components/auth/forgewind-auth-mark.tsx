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
        <div className="overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-lg">
          <ForgeWindLogo size={72} priority className="rounded-2xl" />
        </div>
        <div>
          <span className="text-xl font-semibold tracking-tight text-slate-50 md:text-2xl">
            Forge<span className="gradient-text">Wind</span>
          </span>
          <p className="mt-2 text-xs uppercase tracking-[0.28em] text-slate-400 transition-colors group-hover:text-primary-300">
            AI career intelligence
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

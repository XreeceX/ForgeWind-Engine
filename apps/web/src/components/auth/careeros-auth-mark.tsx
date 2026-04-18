"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CareerOSAuthMark() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8 text-center"
    >
      <Link href="/" className="group inline-block">
        <span className="text-xl font-semibold tracking-tight text-slate-50 md:text-2xl">
          Career<span className="gradient-text">OS</span>
        </span>
        <p className="mt-2 text-xs uppercase tracking-[0.28em] text-slate-400 transition-colors group-hover:text-primary-300">
          career operating system
        </p>
      </Link>
    </motion.div>
  );
}

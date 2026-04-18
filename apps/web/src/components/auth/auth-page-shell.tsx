"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DepthBackground } from "@/components/cinematic/DepthBackground";

interface AuthPageShellProps {
  children: React.ReactNode;
}

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#05060a] text-slate-400">
      <DepthBackground />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.12),transparent)]" />

      <Link
        href="/"
        className="pointer-events-auto absolute left-4 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-400 backdrop-blur-md transition-colors hover:border-white/15 hover:text-slate-50 md:left-8 md:top-7"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20">{children}</div>
    </div>
  );
}

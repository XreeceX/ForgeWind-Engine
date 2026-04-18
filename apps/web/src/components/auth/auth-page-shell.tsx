"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CinematicBackdrop } from "@/components/layout/cinematic-backdrop";

interface AuthPageShellProps {
  children: React.ReactNode;
}

/** Matches dashboard shell: light surface, same backdrop as AppShell, squared controls */
export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <CinematicBackdrop />

      <Link
        href="/"
        className="pointer-events-auto absolute left-4 top-5 z-20 inline-flex items-center gap-2 border border-border bg-panel/90 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-md transition-colors hover:bg-panel-elevated hover:text-slate-900 md:left-8 md:top-7"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20">{children}</div>
    </div>
  );
}

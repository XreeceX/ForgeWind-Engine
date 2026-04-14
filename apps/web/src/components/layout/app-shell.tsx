"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { CinematicBackdrop } from "@/components/layout/cinematic-backdrop";
import { CommandPalette } from "@/components/layout/command-palette";
import { TopNav } from "@/components/layout/top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <CinematicBackdrop />
      <AppSidebar />
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <TopNav />
        <main className="cinematic-surface flex-1 px-6 py-6">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}

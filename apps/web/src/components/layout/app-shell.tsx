"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CinematicBackdrop } from "@/components/layout/cinematic-backdrop";
import { CommandPalette } from "@/components/layout/command-palette";
import { TopNav } from "@/components/layout/top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <CinematicBackdrop />
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <TopNav onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="cinematic-surface flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}

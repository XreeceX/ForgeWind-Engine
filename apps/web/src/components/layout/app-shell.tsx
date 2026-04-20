"use client";

import { useState } from "react";
import { DepthBackground } from "@/components/cinematic/DepthBackground";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { TopNav } from "@/components/layout/top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Same cinematic wallpaper as scroll mode; shell sits above via z-index */}
      <DepthBackground className="z-0" />
      <div className="relative z-10 flex min-h-dvh flex-col bg-transparent lg:flex-row lg:items-stretch">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="relative flex min-h-dvh min-w-0 flex-1 flex-col">
          <TopNav onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="cinematic-surface flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1200px]">{children}</div>
          </main>
        </div>
      </div>
      <CommandPalette />
    </>
  );
}

"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { TopNav } from "@/components/layout/top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-fw-off-white lg:grid lg:min-h-screen lg:grid-cols-[260px_1fr]">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative flex min-h-screen min-w-0 flex-col">
        <TopNav onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="cinematic-surface flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1200px]">{children}</div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}

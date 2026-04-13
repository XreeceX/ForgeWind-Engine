"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Command, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCareerOSStore } from "@/stores/careeros.store";

const routeLabels: Record<string, { title: string; subtitle: string }> = {
  "/overview": {
    title: "CareerOS Overview",
    subtitle: "Live operating view of your AI career pipeline.",
  },
  "/data-hub": {
    title: "Data Hub",
    subtitle: "Manage repositories and context sources for AI workflows.",
  },
  "/ai-studio": {
    title: "AI Studio",
    subtitle: "Run contextual analysis and craft role-focused outputs.",
  },
  "/content": {
    title: "Content Engine",
    subtitle: "Preview and optimize generated career content assets.",
  },
  "/jobs": {
    title: "Jobs",
    subtitle: "Track role fit and application readiness in real time.",
  },
  "/memory": {
    title: "Memory",
    subtitle: "Persistent career intelligence and signal history.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Configure profile, defaults, and workspace behavior.",
  },
};

export function TopNav() {
  const pathname = usePathname();
  const userProfile = useCareerOSStore((state) => state.userProfile);
  const setCommandPaletteOpen = useCareerOSStore((state) => state.setCommandPaletteOpen);

  const label = useMemo(
    () => routeLabels[pathname] ?? { title: "CareerOS", subtitle: "Career operations workspace" },
    [pathname],
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <p className="text-sm font-semibold text-white">{label.title}</p>
          <p className="text-xs text-slate-400">{label.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setCommandPaletteOpen(true)}>
            <Command className="h-3.5 w-3.5" />
            Command
            <span className="rounded border border-border-light px-1.5 py-0 text-[11px] text-slate-400">Ctrl/Cmd+K</span>
          </Button>
          <div className="ml-2 flex items-center gap-2 rounded-lg border border-border bg-surface-light/60 px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary-300" />
            <div>
              <p className="text-xs font-medium text-slate-200">{userProfile.name}</p>
              <p className="text-[11px] text-slate-400">{userProfile.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

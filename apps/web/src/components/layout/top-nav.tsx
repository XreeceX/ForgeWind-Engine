"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, Home, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForgeWindStore } from "@/stores/forgewind.store";

const routeLabels: Record<string, { title: string; subtitle: string }> = {
  "/overview": {
    title: "ForgeWind Overview",
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

interface TopNavProps {
  onOpenSidebar: () => void;
}

export function TopNav({ onOpenSidebar }: TopNavProps) {
  const pathname = usePathname();
  const userProfile = useForgeWindStore((state) => state.userProfile);
  const setCommandPaletteOpen = useForgeWindStore((state) => state.setCommandPaletteOpen);

  const label = useMemo(
    () => routeLabels[pathname] ?? { title: "ForgeWind", subtitle: "Career operations workspace" },
    [pathname],
  );

  return (
    <header className="sticky top-0 z-30 px-4 pb-2 pt-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between rounded-2xl border border-border/80 bg-panel/75 px-4 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="rounded-lg border border-border/70 p-2 text-muted-foreground transition-colors hover:bg-surface-light lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link
            href="/"
            title="ForgeWind home — cinematic & workspace"
            aria-label="Home"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-surface-light hover:text-foreground sm:px-2.5"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{label.title}</p>
            <p className="text-xs text-muted-foreground">{label.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setCommandPaletteOpen(true)}>
            <Command className="h-3.5 w-3.5" />
            Command
            <span className="rounded border border-border px-1.5 py-0 text-[11px] text-muted-foreground">Ctrl/Cmd+K</span>
          </Button>
          <div className="ml-1 hidden items-center gap-2 rounded-xl border border-border bg-surface-light/80 px-3 py-1.5 sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-primary-400" />
            <div>
              <p className="text-xs font-medium text-foreground">{userProfile.name}</p>
              <p className="text-[11px] text-muted-foreground">{userProfile.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

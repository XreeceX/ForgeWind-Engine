"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command, Search } from "lucide-react";
import { useForgeWindStore } from "@/stores/forgewind.store";
import { cn } from "@/lib/cn";

type PaletteCommand = {
  id: string;
  label: string;
  subtitle: string;
  onSelect: () => void;
};

export function CommandPalette() {
  const pathname = usePathname();
  const router = useRouter();
  const open = useForgeWindStore((state) => state.commandPaletteOpen);
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);
  const setCommandPaletteOpen = useForgeWindStore((state) => state.setCommandPaletteOpen);
  const setAIStatus = useForgeWindStore((state) => state.setAIStatus);
  const setAIFocus = useForgeWindStore((state) => state.setAIFocus);
  const [query, setQuery] = useState("");

  const commands = useMemo<PaletteCommand[]>(
    () => [
      {
        id: "go-forgewind-engine",
        label: "ForgeWind Engine home",
        subtitle: "Workspace dashboard (work mode)",
        onSelect: () => router.push("/forgewind-engine"),
      },
      {
        id: "go-overview",
        label: "Go to Overview",
        subtitle: "View global career health",
        onSelect: () => router.push("/overview"),
      },
      {
        id: "go-data-hub",
        label: "Open Data Hub",
        subtitle: "Manage repositories and source context",
        onSelect: () => router.push("/data-hub"),
      },
      {
        id: "go-ai-studio",
        label: "Open AI Studio",
        subtitle: "Run analysis and generation workflows",
        onSelect: () => router.push("/ai-studio"),
      },
      {
        id: "rerun-analysis",
        label: "Re-run analysis for selected repository",
        subtitle: selectedRepositoryId || "No repository selected",
        onSelect: () => {
          setAIStatus("running");
          setAIFocus("Re-analyzing repository impact for hiring narrative");
          setTimeout(() => {
            setAIStatus("ready");
          }, 350);
        },
      },
      {
        id: "go-settings",
        label: "Open Settings",
        subtitle: "Adjust profile and workspace defaults",
        onSelect: () => router.push("/settings"),
      },
    ],
    [router, selectedRepositoryId, setAIFocus, setAIStatus],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const isModifier = event.ctrlKey || event.metaKey;
      if (isModifier && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(!open);
      }
      if (event.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setCommandPaletteOpen]);

  useEffect(() => {
    setQuery("");
  }, [pathname, open]);

  const filtered = commands.filter((command) => {
    const haystack = `${command.label} ${command.subtitle}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-overlay p-4 pt-[14vh]"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-border-light bg-panel-elevated shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands..."
            className="h-8 w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />
          <span className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 text-[11px] text-slate-500">
            <Command className="h-3 w-3" />
            K
          </span>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {filtered.map((command) => (
            <button
              key={command.id}
              className={cn(
                "mb-1 flex w-full items-start justify-between rounded-lg px-3 py-2.5 text-left transition-colors",
                "hover:bg-surface-light focus-visible:focus-ring",
              )}
              onClick={() => {
                command.onSelect();
                setCommandPaletteOpen(false);
              }}
            >
              <span className="text-sm font-medium text-slate-100">{command.label}</span>
              <span className="pl-3 text-xs text-slate-500">{command.subtitle}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="px-3 py-4 text-sm text-slate-500">No commands found for this query.</p>}
        </div>
      </div>
    </div>
  );
}

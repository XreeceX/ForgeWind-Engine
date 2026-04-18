"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  X,
  Database,
  FileText,
  FolderGit2,
  Home,
  LayoutDashboard,
  MemoryStick,
  Settings,
  BriefcaseBusiness,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ForgeWindLogo } from "@/components/brand/forgewind-logo";
import { cn } from "@/lib/cn";
import { useForgeWindStore } from "@/stores/forgewind.store";

const primaryNav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/data-hub", label: "Data Hub", icon: Database },
  { href: "/ai-studio", label: "AI Studio", icon: BrainCircuit },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/memory", label: "Memory", icon: MemoryStick },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);
  const repositories = useForgeWindStore((state) => state.repositories);
  const selectedRepo = repositories.find((repo) => repo.id === selectedRepositoryId);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/25 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-[18.5rem] border-r border-border/70 bg-white/75 px-4 py-4 shadow-lg backdrop-blur-2xl transition-transform duration-300 lg:sticky lg:z-20 lg:h-screen lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center justify-between gap-3 px-2">
          <Link
            href="/"
            onClick={onClose}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-1 transition-colors hover:bg-white/80"
            title="Back to ForgeWind home"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-border/50 shadow-sm">
              <ForgeWindLogo size={40} className="h-10 w-10" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-sm font-semibold text-foreground">ForgeWind</p>
              <p className="text-xs text-slate-500">Intelligence layer</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border/70 p-1.5 text-slate-500 transition-colors hover:bg-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-1.5">
          {primaryNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
                  active
                    ? "bg-violet-100/70 text-foreground shadow-sm ring-1 ring-violet-200/70"
                    : "text-slate-500 hover:bg-white/80 hover:text-slate-900",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4.5 w-4.5 transition-colors",
                    active ? "text-violet-500" : "text-slate-400 group-hover:text-slate-600",
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Card className="mt-6 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Active repository</p>
          <div className="mt-2 flex items-start gap-2.5">
            <FolderGit2 className="mt-0.5 h-4 w-4 text-violet-500" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                {selectedRepo?.fullName ?? "None selected"}
              </p>
              <p className="text-xs text-slate-500">
                {selectedRepo?.summary ?? "Select a repository in Data Hub."}
              </p>
            </div>
          </div>
        </Card>
      </aside>
    </>
  );
}

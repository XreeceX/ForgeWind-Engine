"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  Database,
  FileText,
  FolderGit2,
  LayoutDashboard,
  MemoryStick,
  Settings,
  BriefcaseBusiness,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { useCareerOSStore } from "@/stores/careeros.store";

const primaryNav = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/data-hub", label: "Data Hub", icon: Database },
  { href: "/ai-studio", label: "AI Studio", icon: BrainCircuit },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/memory", label: "Memory", icon: MemoryStick },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const selectedRepositoryId = useCareerOSStore((state) => state.selectedRepositoryId);
  const repositories = useCareerOSStore((state) => state.repositories);
  const selectedRepo = repositories.find((repo) => repo.id === selectedRepositoryId);

  return (
    <aside className="w-72 border-r border-border bg-surface/70 px-4 py-4 backdrop-blur-xl">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow-primary">
          <BrainCircuit className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">CareerOS</p>
          <p className="text-xs text-slate-400">Forge Engine</p>
        </div>
      </div>

      <nav className="space-y-1.5">
        {primaryNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                active
                  ? "bg-primary-500/12 text-primary-300 shadow-glow-primary"
                  : "text-slate-400 hover:bg-surface-light hover:text-slate-100",
              )}
            >
              <item.icon className={cn("h-4.5 w-4.5", active ? "text-primary-300" : "text-slate-500")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Card className="mt-6 p-4">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">Active repository</p>
        <div className="mt-2 flex items-start gap-2.5">
          <FolderGit2 className="mt-0.5 h-4 w-4 text-primary-400" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-100">{selectedRepo?.fullName ?? "None selected"}</p>
            <p className="text-xs text-slate-400">{selectedRepo?.summary ?? "Select a repository in Data Hub."}</p>
          </div>
        </div>
      </Card>
    </aside>
  );
}

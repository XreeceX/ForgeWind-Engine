"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Briefcase,
  PenTool,
  Database,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/stores/app.store";
import { useAuthStore } from "@/stores/auth.store";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Profile", icon: User, href: "/profile" },
  { label: "Data Hub", icon: Database, href: "/data-hub" },
  { label: "Jobs", icon: Briefcase, href: "/jobs" },
  { label: "Content", icon: PenTool, href: "/content" },
  { label: "Skills", icon: TrendingUp, href: "/skills" },
  { label: "Network", icon: Users, href: "/network" },
  { label: "Applications", icon: FileText, href: "/applications" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "AI Agents", icon: Bot, href: "/agents" },
  { label: "Settings", icon: Settings, href: "/settings" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-surface transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <span className="text-lg font-bold gradient-text">Forge Engine</span>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-surface-light hover:text-white transition-colors"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              !sidebarOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-500/10 text-primary-400 shadow-sm"
                  : "text-slate-400 hover:bg-surface-light hover:text-slate-200"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive && "text-primary-400"
                )}
              />
              {sidebarOpen && <span>{item.label}</span>}
              {isActive && sidebarOpen && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 text-sm font-semibold">
            {(user?.name ?? "User")
              .split(" ")
              .map((n) => n[0])
              .join("") ?? "U"}
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium text-slate-200">
                {user?.name ?? "User"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email ?? ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

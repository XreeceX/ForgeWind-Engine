"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Command, Home, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForgeWindStore } from "@/stores/forgewind.store";
import { cn } from "@/lib/cn";

function formatCrumb(segment: string) {
  if (segment === "ai-studio") return "AI Studio";
  if (segment === "data-hub") return "Data Hub";
  if (segment === "forgewind-engine") return "ForgeWind Engine";
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface TopNavProps {
  onOpenSidebar: () => void;
}

export function TopNav({ onOpenSidebar }: TopNavProps) {
  const pathname = usePathname();
  const userProfile = useForgeWindStore((state) => state.userProfile);
  const setCommandPaletteOpen = useForgeWindStore((state) => state.setCommandPaletteOpen);

  const breadcrumbs = useMemo(() => {
    if (pathname === "/" || pathname === "") return ["Workspace"];
    const parts = pathname.split("/").filter(Boolean);
    return ["Workspace", ...parts.map(formatCrumb)];
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-fw-gray-100 bg-fw-white">
      <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="rounded-fw-btn p-2 text-fw-gray-400 transition-colors duration-200 hover:bg-fw-gray-50 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link
            href="/"
            className="hidden rounded-fw-btn p-2 text-fw-gray-400 transition-colors duration-200 hover:bg-fw-gray-50 sm:inline-flex"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 text-xs text-fw-gray-400 md:flex">
            {breadcrumbs.map((crumb, i) => (
              <span key={`${crumb}-${i}`} className="flex items-center gap-1 truncate">
                {i > 0 ? <ChevronRight className="h-3 w-3 shrink-0 opacity-50" /> : null}
                <span className={cn("truncate", i === breadcrumbs.length - 1 && "font-medium text-fw-gray-700")}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        </div>

        <h1 className="hidden text-center text-sm font-semibold text-fw-gray-900 sm:block">
          ForgeWind workspace
        </h1>

        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="hidden sm:inline-flex"
            onClick={() => setCommandPaletteOpen(true)}
          >
            <Command className="h-3.5 w-3.5" />
            Command
            <span className="rounded border border-fw-gray-100 px-1.5 py-0 text-[11px] text-fw-gray-400">
              ⌘K
            </span>
          </Button>
          <div className="hidden items-center gap-2 rounded-fw-btn border border-fw-gray-100 bg-fw-white px-3 py-1.5 sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-fw-orange" />
            <div className="text-left">
              <p className="text-xs font-medium text-fw-gray-900">{userProfile.name}</p>
              <p className="text-[11px] text-fw-gray-400">{userProfile.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

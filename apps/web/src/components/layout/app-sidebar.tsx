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
  ChevronDown,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
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

const listVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } },
};

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);
  const repositories = useForgeWindStore((state) => state.repositories);
  const userProfile = useForgeWindStore((state) => state.userProfile);
  const selectedRepo = repositories.find((repo) => repo.id === selectedRepositoryId);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-fw-gray-900/20 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-[260px] flex-col border-r border-fw-gray-100 bg-fw-white transition-transform duration-200",
          "lg:static lg:z-10 lg:h-screen lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-fw-gray-100 px-4 py-4">
          <Link
            href="/"
            onClick={onClose}
            className="flex min-w-0 flex-1 items-center gap-3"
            title="ForgeWind home"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-fw-btn bg-fw-orange-light ring-1 ring-fw-orange-mid">
              <ForgeWindLogo size={40} className="h-10 w-10" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-sm font-semibold text-fw-gray-900">ForgeWind</p>
              <p className="text-xs text-fw-gray-400">AIML intelligence layer</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-fw-btn p-2 text-fw-gray-400 transition-colors duration-200 hover:bg-fw-gray-50 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <motion.ul
            className="space-y-0.5"
            initial="hidden"
            animate="show"
            variants={listVariants}
          >
            {primaryNav.map((item) => {
              const active =
                pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              const homeActive = item.href === "/" && pathname === "/";
              const isActive = item.href === "/" ? homeActive : active;

              return (
                <motion.li key={item.href} variants={itemVariants}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex h-12 items-center gap-3 rounded-r-[12px] border-l-[3px] pl-3 pr-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "border-l-fw-orange bg-fw-orange-light text-fw-orange"
                        : "border-l-transparent text-fw-gray-700 hover:border-l-fw-orange-mid hover:bg-fw-gray-50 hover:text-fw-orange",
                    )}
                  >
                    <motion.span
                      className="flex h-8 w-8 items-center justify-center"
                      animate={
                        isActive
                          ? { scale: [1, 1.06, 1], boxShadow: ["0 0 0 0 rgba(249,115,22,0)", "0 0 12px rgba(249,115,22,0.35)", "0 0 0 0 rgba(249,115,22,0)"] }
                          : {}
                      }
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5",
                          isActive ? "text-fw-orange" : "text-fw-gray-400 group-hover:text-fw-orange",
                        )}
                      />
                    </motion.span>
                    <span>{item.label}</span>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        </nav>

        <div className="mt-auto border-t border-fw-gray-100 p-3">
          <div className="rounded-fw-card border border-fw-orange-mid bg-fw-orange-light/50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-fw-orange">
              Active repo
            </p>
            <div className="mt-2 flex items-start gap-2">
              <FolderGit2 className="mt-0.5 h-4 w-4 shrink-0 text-fw-orange" />
              <div className="min-w-0">
                <p className="truncate font-mono text-xs font-medium text-fw-gray-900">
                  {selectedRepo?.fullName ?? "None selected"}
                </p>
                <p className="text-[11px] text-fw-gray-400">
                  {selectedRepo?.summary ?? "Select a repository in Data Hub."}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-3 flex w-full items-center justify-between rounded-fw-btn px-2 py-2 text-left text-sm font-medium text-fw-gray-900 transition-colors duration-200 hover:bg-fw-gray-50"
          >
            <span>{userProfile.name}</span>
            <ChevronDown className="h-4 w-4 text-fw-gray-400" />
          </button>
        </div>
      </aside>
    </>
  );
}

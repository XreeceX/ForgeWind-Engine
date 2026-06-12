'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BrainCircuit,
  ChevronDown,
  Check,
  X,
  Database,
  ExternalLink,
  FileText,
  FolderGit2,
  Home,
  LayoutDashboard,
  MemoryStick,
  Plus,
  Settings,
  BriefcaseBusiness,
  LogOut,
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { ForgeWindLogo } from '@/components/brand/forgewind-logo';
import { cn } from '@/lib/cn';
import { useForgeWindStore } from '@/stores/forgewind.store';

const primaryNav = [
  { href: '/forgewind-engine', label: 'Home', icon: Home },
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/data-hub', label: 'Data Hub', icon: Database },
  { href: '/ai-studio', label: 'AI Studio', icon: BrainCircuit },
  { href: '/content', label: 'Content', icon: FileText },
  { href: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { href: '/memory', label: 'Memory', icon: MemoryStick },
  { href: '/settings', label: 'Settings', icon: Settings },
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
  const router = useRouter();
  const { data: session } = useSession();
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);
  const repositories = useForgeWindStore((state) => state.repositories);
  const setSelectedRepository = useForgeWindStore((state) => state.setSelectedRepository);
  const selectedRepo = repositories.find((repo) => repo.id === selectedRepositoryId);
  const accessToken = session?.accessToken as string | undefined;

  const [repoPopoverOpen, setRepoPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!repoPopoverOpen) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setRepoPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [repoPopoverOpen]);

  const userName = session?.user?.name ?? '';
  const userEmail = session?.user?.email ?? '';
  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-foreground/20 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-full w-[260px] flex-col border-r border-border bg-panel transition-transform duration-200',
          'lg:relative lg:z-10 lg:h-auto lg:shrink-0 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo / header */}
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
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
              <p className="text-sm font-semibold text-foreground">ForgeWind</p>
              <p className="text-xs text-muted-foreground">AIML intelligence layer</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-fw-btn p-2 text-muted-foreground transition-colors duration-200 hover:bg-surface-light lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <motion.ul
            className="space-y-0.5"
            initial="hidden"
            animate="show"
            variants={listVariants}
          >
            {primaryNav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/forgewind-engine' && pathname.startsWith(`${item.href}/`));
              const homeActive =
                item.href === '/forgewind-engine' && pathname === '/forgewind-engine';
              const isActive = item.href === '/forgewind-engine' ? homeActive : active;

              return (
                <motion.li key={item.href} variants={itemVariants}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'group flex h-12 items-center gap-3 rounded-r-[12px] border-l-[3px] pl-3 pr-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'border-l-fw-orange bg-fw-orange-light text-fw-orange'
                        : 'border-l-transparent text-foreground hover:border-l-fw-orange-mid hover:bg-surface-light hover:text-fw-orange',
                    )}
                  >
                    <motion.span
                      className="flex h-8 w-8 items-center justify-center"
                      animate={
                        isActive
                          ? {
                              scale: [1, 1.06, 1],
                              boxShadow: [
                                '0 0 0 0 rgba(249,115,22,0)',
                                '0 0 12px rgba(249,115,22,0.35)',
                                '0 0 0 0 rgba(249,115,22,0)',
                              ],
                            }
                          : {}
                      }
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                      <item.icon
                        className={cn(
                          'h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5',
                          isActive
                            ? 'text-fw-orange'
                            : 'text-muted-foreground group-hover:text-fw-orange',
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

        {/* Footer */}
        <div className="mt-auto border-t border-border p-3 space-y-2">
          {/* Active repo — interactive popover */}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setRepoPopoverOpen((v) => !v)}
              className={cn(
                'w-full rounded-fw-card border p-3 text-left transition-colors duration-150',
                'hover:border-fw-orange-mid hover:bg-fw-orange-light/30',
                selectedRepo
                  ? 'border-fw-orange-mid bg-fw-orange-light/50'
                  : 'border-border bg-surface-light',
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-fw-orange">
                  Active repo
                </p>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-muted-foreground transition-transform duration-150',
                    repoPopoverOpen && 'rotate-180',
                  )}
                />
              </div>
              <div className="mt-2 flex items-start gap-2">
                <FolderGit2 className="mt-0.5 h-4 w-4 shrink-0 text-fw-orange" />
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-medium text-foreground">
                    {selectedRepo?.fullName ?? 'None selected'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedRepo ? selectedRepo.language : 'Click to connect or switch repos'}
                  </p>
                </div>
              </div>
            </button>

            {/* Popover */}
            {repoPopoverOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 rounded-fw-card border border-border bg-panel shadow-md">
                {repositories.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-3">
                      No repositories connected yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setRepoPopoverOpen(false);
                        onClose();
                        router.push('/data-hub');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-fw-btn bg-fw-orange px-3 py-1.5 text-xs font-medium text-white hover:bg-fw-deep"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Connect a repo
                    </button>
                  </div>
                ) : (
                  <ul className="max-h-52 overflow-y-auto py-1">
                    {repositories.map((repo) => (
                      <li key={repo.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRepository(repo.id, accessToken);
                            setRepoPopoverOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-light"
                        >
                          <FolderGit2 className="h-3.5 w-3.5 shrink-0 text-fw-orange" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-mono text-xs font-medium text-foreground">
                              {repo.fullName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{repo.language}</p>
                          </div>
                          {repo.id === selectedRepositoryId && (
                            <Check className="h-3.5 w-3.5 shrink-0 text-fw-orange" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-border px-3 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRepoPopoverOpen(false);
                      onClose();
                      router.push('/data-hub');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-fw-orange"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Manage in Data Hub
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User info */}
          <div className="flex items-center gap-2 rounded-fw-btn px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-xs font-semibold text-primary-600">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {userName || 'Loading…'}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">{userEmail}</p>
            </div>
          </div>

          {/* Sign out */}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-2.5 rounded-fw-btn px-3 py-2 text-sm font-medium text-red-500 transition-colors duration-200 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

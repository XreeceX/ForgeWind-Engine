'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  Command,
  Home,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sparkles,
  Sun,
  User,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useForgeWindStore } from '@/stores/forgewind.store';
import { cn } from '@/lib/cn';

function formatCrumb(segment: string) {
  if (segment === 'ai-studio') return 'AI Studio';
  if (segment === 'data-hub') return 'Data Hub';
  if (segment === 'forgewind-engine') return 'ForgeWind Engine';
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface TopNavProps {
  onOpenSidebar: () => void;
}

export function TopNav({ onOpenSidebar }: TopNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const setCommandPaletteOpen = useForgeWindStore((state) => state.setCommandPaletteOpen);
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

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const breadcrumbs = useMemo(() => {
    if (pathname === '/' || pathname === '') return ['Workspace'];
    const parts = pathname.split('/').filter(Boolean);
    return ['Workspace', ...parts.map(formatCrumb)];
  }, [pathname]);

  const isDark = resolvedTheme === 'dark';

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-panel">
      <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left — sidebar toggle + breadcrumbs */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="rounded-fw-btn p-2 text-muted-foreground transition-colors duration-200 hover:bg-surface-light lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link
            href="/"
            className="hidden rounded-fw-btn p-2 text-muted-foreground transition-colors duration-200 hover:bg-surface-light sm:inline-flex"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
          <nav
            aria-label="Breadcrumb"
            className="hidden min-w-0 items-center gap-1 text-xs text-muted-foreground md:flex"
          >
            {breadcrumbs.map((crumb, i) => (
              <span key={`${crumb}-${i}`} className="flex items-center gap-1 truncate">
                {i > 0 ? <ChevronRight className="h-3 w-3 shrink-0 opacity-50" /> : null}
                <span
                  className={cn(
                    'truncate',
                    i === breadcrumbs.length - 1 && 'font-medium text-foreground',
                  )}
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        </div>

        {/* Centre — workspace label */}
        <h1 className="hidden text-center text-sm font-semibold text-foreground sm:block">
          ForgeWind workspace
        </h1>

        {/* Right — theme toggle + command + user menu */}
        <div className="flex items-center justify-end gap-2">
          {/* Dark / Light toggle */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="rounded-fw-btn p-2 text-muted-foreground transition-colors duration-200 hover:bg-surface-light"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Button
            size="sm"
            variant="secondary"
            className="hidden sm:inline-flex"
            onClick={() => setCommandPaletteOpen(true)}
          >
            <Command className="h-3.5 w-3.5" />
            Command
            <span className="rounded border border-border px-1.5 py-0 text-[11px] text-muted-foreground">
              ⌘K
            </span>
          </Button>

          {/* Profile chip + dropdown */}
          <div className="relative hidden sm:block" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className={cn(
                'flex items-center gap-2 rounded-fw-btn border px-3 py-1.5 transition-colors duration-150',
                profileOpen
                  ? 'border-fw-orange bg-fw-orange-light/40'
                  : 'border-border bg-panel hover:border-fw-orange-mid hover:bg-surface-light',
              )}
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              <Sparkles className="h-3.5 w-3.5 text-fw-orange" />
              <div className="text-left">
                <p className="text-xs font-medium text-foreground">{userName || 'Loading…'}</p>
                <p className="text-[11px] text-muted-foreground">{userEmail}</p>
              </div>
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-fw-card border border-border bg-panel shadow-md z-50">
                {/* Avatar row */}
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-sm font-semibold text-primary-600">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{userEmail}</p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-surface-light"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    View profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-surface-light"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-border py-1">
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

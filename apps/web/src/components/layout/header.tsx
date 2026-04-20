"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Search, ChevronDown, LogOut, User, Settings, Home } from "lucide-react";
import { cn } from "@/lib/cn";
import { signOut as nextAuthSignOut } from "next-auth/react";
import { useAppStore } from "@/stores/app.store";
import { useAuthStore } from "@/stores/auth.store";
import { formatDistanceToNow } from "date-fns";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { notifications, markNotificationRead } = useAppStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 mb-4 flex h-16 items-center justify-between rounded-2xl border border-border/80 bg-panel/75 px-4 shadow-sm backdrop-blur-xl sm:px-6">
      {/* Left: Home + Title */}
      <div className="flex min-w-0 items-start gap-3">
        <Link
          href="/"
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-light text-muted-foreground transition-colors hover:border-border-light hover:bg-surface-lighter hover:text-foreground"
          title="ForgeWind home"
          aria-label="ForgeWind home"
        >
          <Home className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <div
            className={cn(
              "flex items-center rounded-lg border border-border bg-surface-light transition-all duration-200",
              searchOpen ? "w-72" : "w-10"
            )}
          >
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
            {searchOpen && (
              <input
                autoFocus
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 flex-1 bg-transparent pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            )}
          </div>
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-light text-muted-foreground transition-colors hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 rounded-xl border border-border bg-panel shadow-lg">
              <div className="border-b border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Notifications
                </h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        "flex w-full flex-col gap-1 border-b border-border p-4 text-left transition-colors hover:bg-surface-light",
                        !n.read && "bg-primary-500/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-primary-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-light px-3 py-1.5 transition-colors hover:bg-surface-lighter"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 text-xs font-semibold">
              {(user?.name ?? "User")
                .split(" ")
                .map((n) => n[0])
                .join("") ?? "U"}
            </div>
            <span className="text-sm font-medium text-foreground">
              {user?.name?.split(" ")[0] ?? "User"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-xl border border-border bg-panel shadow-lg">
              <div className="border-b border-border p-3">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="p-1.5">
                <a
                  href="/profile"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-surface-light hover:text-foreground"
                >
                  <User className="h-4 w-4" />
                  View Profile
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-surface-light hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </a>
                <button
                  onClick={async () => {
                    await nextAuthSignOut({ redirect: false });
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * Layer 5 — No meaningful UI until the client confirms a JWT session.
 * Middleware already blocks unauthenticated requests; this avoids flashing
 * sensitive layout in edge client-navigation cases and keeps the first paint minimal.
 */
export function ProtectedSessionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [mounted, router, status]);

  if (!mounted || status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="h-1 w-48 max-w-full overflow-hidden bg-slate-200">
          <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-primary-500 to-accent-500" />
        </div>
        <p className="mt-6 text-sm text-slate-500">Verifying session…</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-slate-500">
        Redirecting to sign in…
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-slate-500">
        Verifying session…
      </div>
    );
  }

  return (
    <div className="min-h-screen select-none [&_input]:select-text [&_textarea]:select-text [&_select]:select-text">
      {children}
    </div>
  );
}

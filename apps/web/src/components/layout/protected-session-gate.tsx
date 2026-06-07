'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const SESSION_TIMEOUT_MS = 6000;

/**
 * Client guard: confirms an active session before rendering protected layout.
 * Middleware is the primary protection; this handles client-side navigation edge cases.
 * If session loading takes longer than SESSION_TIMEOUT_MS, redirect to login.
 */
export function ProtectedSessionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);
  const timedOut = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timeout fallback: if session is still loading after threshold, send to login.
  useEffect(() => {
    if (!mounted) return;
    if (status !== 'loading') return;
    const t = setTimeout(() => {
      timedOut.current = true;
      router.replace('/login');
    }, SESSION_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [mounted, status, router]);

  useEffect(() => {
    if (!mounted || status === 'loading') return;
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [mounted, router, status]);

  if (!mounted || status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="h-1 w-48 max-w-full overflow-hidden bg-slate-200">
          <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-primary-500 to-accent-500" />
        </div>
        <p className="mt-6 text-sm text-slate-500">Verifying session…</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-slate-500">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="min-h-screen select-none [&_input]:select-text [&_textarea]:select-text [&_select]:select-text">
      {children}
    </div>
  );
}

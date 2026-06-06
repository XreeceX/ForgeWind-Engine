'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Mounted inside the protected layout.
 * Syncs the NextAuth session into the lightweight Zustand UI store so that
 * header, sidebar, and dashboard components can read user identity without
 * needing to call useSession themselves.
 */
export function SyncSessionToStore() {
  const { data: session, status } = useSession();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        linkedinConnected: false,
      });
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
  }, [status, session, setUser]);

  return null;
}

'use client';

import { useSession } from 'next-auth/react';

export function useForgeWindAccessToken(): string | null {
  const { data: session } = useSession();
  return session?.accessToken ?? null;
}

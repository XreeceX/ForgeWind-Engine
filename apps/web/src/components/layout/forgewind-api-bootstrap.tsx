'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import {
  ForgeWindApiNotConfiguredError,
  forgeWindJson,
  getForgeWindApiBaseUrl,
  mapForgeWindRepositoryToSummary,
  type ForgeWindApiAgentState,
  type ForgeWindApiRepository,
  type ForgeWindApiUser,
} from '@/lib/forgewind-api';
import { useForgeWindStore } from '@/stores/forgewind.store';

/**
 * One-time sync after session is ready: resolve ForgeWind user via JWT + load repositories.
 * Requires `NEXT_PUBLIC_FORGEWIND_API_URL` (e.g. http://localhost:3001).
 */
export function ForgeWindApiBootstrap() {
  const { data: session, status } = useSession();
  const applyForgeWindUserFromApi = useForgeWindStore((s) => s.applyForgeWindUserFromApi);
  const setRepositories = useForgeWindStore((s) => s.setRepositories);

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!getForgeWindApiBaseUrl()) return;

    const accessToken = session?.accessToken;
    if (!accessToken) return;

    let cancelled = false;

    void (async () => {
      try {
        const profile = await forgeWindJson<{ id: string }>('/profile/me', {
          accessToken,
        }).catch(() => null);

        const user = profile
          ? await forgeWindJson<ForgeWindApiUser>(`/users/${profile.id}`, { accessToken })
          : null;

        if (cancelled || !user) return;

        applyForgeWindUserFromApi(user);

        const repoRows = await forgeWindJson<ForgeWindApiRepository[]>('/repositories', {
          accessToken,
        });
        if (cancelled) return;

        const mapped = repoRows.map(mapForgeWindRepositoryToSummary);
        setRepositories(mapped);

        const active = repoRows.find((r) => r.isActive);
        const nextId = active?.id ?? mapped[0]?.id ?? '';
        useForgeWindStore.setState({ selectedRepositoryId: nextId });

        const agent = await forgeWindJson<ForgeWindApiAgentState>('/agent-state', {
          accessToken,
        });
        if (!cancelled && agent) {
          useForgeWindStore.getState().setAgentSnapshot({
            mode: agent.mode,
            agentStatus: agent.agentStatus,
            lastAction: agent.lastAction,
          });
        }
      } catch (e) {
        if (e instanceof ForgeWindApiNotConfiguredError) return;
        console.warn('[ForgeWind API bootstrap]', e);
        toast.error('Could not bootstrap ForgeWind profile from API.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, session?.accessToken, applyForgeWindUserFromApi, setRepositories]);

  return null;
}

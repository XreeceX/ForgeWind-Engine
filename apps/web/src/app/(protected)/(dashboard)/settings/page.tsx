'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  type ForgeWindApiAgentState,
  forgeWindJson,
  getForgeWindApiBaseUrl,
} from '@/lib/forgewind-api';
import { useForgeWindAccessToken } from '@/hooks/use-forgewind-access-token';
import { useForgeWindStore } from '@/stores/forgewind.store';

const agentModes = ['focus', 'explore', 'rest'] as const;

export default function SettingsPage() {
  const accessToken = useForgeWindAccessToken();
  const userProfile = useForgeWindStore((state) => state.userProfile);
  const memoryContext = useForgeWindStore((state) => state.memoryContext);
  const updateMemoryContext = useForgeWindStore((state) => state.updateMemoryContext);
  const agentSnapshot = useForgeWindStore((state) => state.agentSnapshot);
  const setAgentSnapshot = useForgeWindStore((state) => state.setAgentSnapshot);

  const [tone, setTone] = useState(memoryContext.preferredTone);

  const apiReady = !!getForgeWindApiBaseUrl() && !!accessToken;

  const patchAgent = useMutation({
    mutationFn: async (mode: (typeof agentModes)[number]) =>
      forgeWindJson<ForgeWindApiAgentState>('/agent-state', {
        method: 'PATCH',
        accessToken: accessToken!,
        body: JSON.stringify({ mode }),
      }),
    onSuccess: (row) => {
      if (!row) return;
      setAgentSnapshot({
        mode: row.mode,
        agentStatus: row.agentStatus,
        lastAction: row.lastAction,
      });
      toast.success('Agent mode updated');
    },
    onError: () => {
      toast.error('Could not update agent mode.');
    },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <Card className="p-5">
        <p className="text-sm font-semibold text-foreground">User profile</p>
        <p className="mt-1 text-sm text-fw-gray-700">{userProfile.name}</p>
        <p className="text-xs text-muted-foreground">{userProfile.headline}</p>
      </Card>

      {apiReady ? (
        <Card className="p-5">
          <p className="text-sm font-semibold text-foreground">ForgeWind agent mode</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Synced with the ForgeWind API layer (stub auth via{' '}
            <code className="rounded bg-muted px-1">X-User-Id</code>).
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Status: <span className="font-medium">{agentSnapshot?.agentStatus ?? '—'}</span>
            {agentSnapshot?.lastAction ? <> · Last action: {agentSnapshot.lastAction}</> : null}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <select
              aria-label="Agent mode"
              value={agentSnapshot?.mode ?? 'focus'}
              disabled={patchAgent.isPending}
              onChange={(event) =>
                patchAgent.mutate(event.target.value as (typeof agentModes)[number])
              }
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/25"
            >
              {agentModes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {patchAgent.isError ? (
              <span className="text-xs text-red-600">Could not update agent state.</span>
            ) : null}
          </div>
        </Card>
      ) : (
        <Card className="p-5">
          <p className="text-sm font-semibold text-foreground">ForgeWind agent mode</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Set <code className="rounded bg-muted px-1">NEXT_PUBLIC_FORGEWIND_API_URL</code> and
            sign in to manage agent mode from the API.
          </p>
        </Card>
      )}

      <Card className="p-5">
        <p className="text-sm font-semibold text-foreground">Memory defaults</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Preferred tone influences AI generation across studio and content pages.
        </p>
        <input
          value={tone}
          onChange={(event) => setTone(event.target.value)}
          className="mt-3 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/25"
        />
        <div className="mt-3 flex justify-end">
          <Button
            onClick={() => {
              updateMemoryContext({ preferredTone: tone });
              toast.success('Preferences saved');
            }}
          >
            Save preferences
          </Button>
        </div>
      </Card>
    </div>
  );
}

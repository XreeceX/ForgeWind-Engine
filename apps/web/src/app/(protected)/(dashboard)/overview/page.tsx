'use client';

import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { RepoCard } from '@/components/dashboard/repo-card';
import { OverviewStatGrid } from '@/components/dashboard/overview-stat-grid';
import { InsightCard } from '@/components/ai-studio/insight-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import {
  type ForgeWindApiRepoSnapshot,
  type ForgeWindApiRepository,
  forgeWindJson,
  getForgeWindApiBaseUrl,
  mapForgeWindRepositoryToSummary,
} from '@/lib/forgewind-api';
import { useForgeWindAccessToken } from '@/hooks/use-forgewind-access-token';
import { useForgeWindStore } from '@/stores/forgewind.store';

export default function OverviewPage() {
  const accessToken = useForgeWindAccessToken();
  const forgeWindUserId = useForgeWindStore((state) => state.forgeWindUserId);
  const repositories = useForgeWindStore((state) => state.repositories);
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);
  const patchRepository = useForgeWindStore((state) => state.patchRepository);
  const setSelectedRepository = useForgeWindStore((state) => state.setSelectedRepository);
  const generatedContent = useForgeWindStore((state) => state.generatedContent);

  const [syncingRepoId, setSyncingRepoId] = useState<string | null>(null);
  const [openConnectModal, setOpenConnectModal] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [form, setForm] = useState({
    githubRepoId: '',
    fullName: '',
    name: '',
    description: '',
    language: 'TypeScript',
  });
  const apiReady = !!getForgeWindApiBaseUrl() && !!accessToken;
  const selectedRepository = repositories.find((repo) => repo.id === selectedRepositoryId);

  const handleRepoSync = useCallback(
    async (repoId: string) => {
      if (!accessToken || !getForgeWindApiBaseUrl()) return;
      setSyncingRepoId(repoId);
      try {
        const snap = await forgeWindJson<ForgeWindApiRepoSnapshot>(`/repositories/${repoId}/sync`, {
          method: 'POST',
          accessToken,
        });
        const health = Math.round(Number(snap.healthScore));
        const focus = Math.round(Number(snap.focusScore));
        patchRepository(repoId, {
          healthScore: Number.isFinite(health) ? health : 70,
          summary: `Synced: ${snap.commitCount30d} commits (30d). Focus ${Number.isFinite(focus) ? focus : '—'} · health ${Number.isFinite(health) ? health : '—'}.`,
        });
        toast.success('Repository synced');
      } catch (err) {
        console.warn('[ForgeWind sync]', err);
        toast.error('Sync failed. Check GitHub/API credentials.');
      } finally {
        setSyncingRepoId(null);
      }
    },
    [accessToken, patchRepository],
  );

  const connectRepo = useCallback(async () => {
    if (!forgeWindUserId || !apiReady || formBusy) return;
    if (!form.fullName.trim() || !form.name.trim() || !form.githubRepoId.trim()) {
      toast.error('Fill repo id, name, and full name.');
      return;
    }
    setFormBusy(true);
    try {
      const created = await forgeWindJson<ForgeWindApiRepository>('/repositories', {
        method: 'POST',
        accessToken,
        body: JSON.stringify({
          githubRepoId: form.githubRepoId.trim(),
          name: form.name.trim(),
          fullName: form.fullName.trim(),
          description: form.description.trim() || undefined,
          language: form.language.trim() || 'TypeScript',
        }),
      });
      const mapped = mapForgeWindRepositoryToSummary(created);
      useForgeWindStore.setState((state) => ({
        repositories: [mapped, ...state.repositories],
        selectedRepositoryId: mapped.id,
      }));
      toast.success('Repository connected');
      setOpenConnectModal(false);
      setForm({
        githubRepoId: '',
        fullName: '',
        name: '',
        description: '',
        language: 'TypeScript',
      });
    } catch (error) {
      console.warn('[ForgeWind connect repo]', error);
      toast.error('Could not connect repository.');
    } finally {
      setFormBusy(false);
    }
  }, [apiReady, accessToken, form, formBusy]);

  const disconnectRepo = useCallback(
    async (repoId: string) => {
      if (!forgeWindUserId || !apiReady) return;
      try {
        await forgeWindJson<void>(`/repositories/${repoId}`, {
          method: 'DELETE',
          accessToken,
        });
        useForgeWindStore.setState((state) => {
          const nextRepos = state.repositories.filter((r) => r.id !== repoId);
          const nextSelected =
            state.selectedRepositoryId === repoId
              ? (nextRepos[0]?.id ?? '')
              : state.selectedRepositoryId;
          return { repositories: nextRepos, selectedRepositoryId: nextSelected };
        });
        toast.success('Repository disconnected');
      } catch (error) {
        console.warn('[ForgeWind disconnect repo]', error);
        toast.error('Could not disconnect repository.');
      }
    },
    [apiReady, accessToken],
  );

  const snapshotQuery = useQuery({
    queryKey: ['forgewind-snapshots', forgeWindUserId, selectedRepositoryId],
    enabled: apiReady && !!selectedRepositoryId,
    queryFn: () =>
      forgeWindJson<ForgeWindApiRepoSnapshot[]>(`/repositories/${selectedRepositoryId}/snapshots`, {
        accessToken,
      }),
  });

  const healthQuery = useQuery({
    queryKey: ['career-health', selectedRepositoryId],
    queryFn: async () => {
      const selected = repositories.find((repo) => repo.id === selectedRepositoryId);
      const scoreBase = selected?.healthScore ?? 70;
      return {
        score: Math.min(98, scoreBase + 7),
        confidence: Math.min(96, scoreBase + 5),
      };
    },
  });

  return (
    <div className="space-y-6">
      <OverviewStatGrid repoCount={repositories.length} contentCount={generatedContent.length} />

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="xl:col-span-2"
        >
          <Card className="cinematic-card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Repository intelligence</p>
                <p className="text-xs text-muted-foreground">
                  Select a repository to scope every AI panel across ForgeWind.
                </p>
              </div>
              {apiReady ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => setOpenConnectModal(true)}
                >
                  Connect repo
                </Button>
              ) : null}
            </div>
            {repositories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No repositories connected yet. With{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  NEXT_PUBLIC_FORGEWIND_API_URL
                </code>{' '}
                set and the API running, add a repo.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {repositories.map((repo) => (
                  <div key={repo.id} className="space-y-2">
                    <RepoCard
                      repo={repo}
                      selected={selectedRepositoryId === repo.id}
                      onSelect={setSelectedRepository}
                      onSync={apiReady ? handleRepoSync : undefined}
                      isSyncing={syncingRepoId === repo.id}
                    />
                    {apiReady ? (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => disconnectRepo(repo.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="cinematic-card rounded-xl">
            <InsightCard
              title="Pipeline confidence"
              insight={`Analysis confidence is ${healthQuery.data?.confidence ?? 0}%. Selected repository health drives job and content fit scoring.`}
            />
          </div>
          <div className="cinematic-card rounded-xl">
            <InsightCard
              title="Career score trend"
              insight={`Current score: ${healthQuery.data?.score ?? 0}. Improve with more quantified outcomes and architecture-focused content.`}
            />
          </div>
          <Card className="p-4">
            <p className="text-sm font-semibold text-foreground">Snapshot timeline</p>
            <p className="mb-3 text-xs text-muted-foreground">
              {selectedRepository
                ? `Recent sync history for ${selectedRepository.fullName}`
                : 'Select a repository to view sync history.'}
            </p>
            {snapshotQuery.isLoading ? (
              <p className="text-xs text-muted-foreground">Loading snapshots…</p>
            ) : snapshotQuery.isError ? (
              <p className="text-xs text-red-600">Could not load snapshot history.</p>
            ) : (snapshotQuery.data?.length ?? 0) === 0 ? (
              <p className="text-xs text-muted-foreground">
                No snapshots yet. Sync a repository to create one.
              </p>
            ) : (
              <div className="space-y-2">
                {snapshotQuery.data!.slice(0, 4).map((s) => (
                  <div key={s.id} className="rounded-md border border-border p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{new Date(s.capturedAt).toLocaleString()}</span>
                      <span>{Math.round(Number(s.healthScore))}% health</span>
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      {s.commitCount30d} commits / 30d · focus {Math.round(Number(s.focusScore))}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
      <Modal
        open={openConnectModal}
        onClose={() => setOpenConnectModal(false)}
        title="Connect repository"
        size="md"
      >
        <div className="space-y-3">
          <input
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            placeholder="GitHub repo id (numeric string)"
            value={form.githubRepoId}
            onChange={(e) => setForm((f) => ({ ...f, githubRepoId: e.target.value }))}
          />
          <input
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            placeholder="Repo name (e.g. forgewind-web)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            placeholder="Full name (owner/repo)"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <input
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            placeholder="Primary language"
            value={form.language}
            onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
          />
          <textarea
            className="min-h-[90px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            placeholder="Optional description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpenConnectModal(false)}>
              Cancel
            </Button>
            <Button type="button" loading={formBusy} onClick={connectRepo}>
              Connect
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

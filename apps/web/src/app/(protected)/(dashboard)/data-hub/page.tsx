'use client';

import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Github, Loader2, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { RepoCard } from '@/components/dashboard/repo-card';
import { AnalysisDrawer } from '@/components/data-hub/analysis-drawer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  forgeWindJson,
  getForgeWindApiBaseUrl,
  mapForgeWindRepositoryToSummary,
  type ForgeWindApiRepository,
} from '@/lib/forgewind-api';
import { useForgeWindStore } from '@/stores/forgewind.store';

/* ── GitHub public API ── */
async function fetchGitHubMeta(fullName: string) {
  const res = await fetch(`https://api.github.com/repos/${fullName}`);
  if (!res.ok)
    throw new Error(
      res.status === 404
        ? 'Repository not found on GitHub.'
        : 'GitHub API error — check the repo name and try again.',
    );
  return res.json() as Promise<{
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    language: string | null;
  }>;
}

/* ── normalise "https://github.com/owner/repo" or "owner/repo" ── */
function parseRepoInput(raw: string): string {
  const stripped = raw.trim().replace(/\/$/, '');
  const ghUrl = stripped.match(/github\.com\/([^/]+\/[^/]+)/);
  return ghUrl ? ghUrl[1] : stripped;
}

/* ────────────────────────────────────────────────── */

export default function DataHubPage() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken as string | undefined;
  const queryClient = useQueryClient();

  const setRepositories = useForgeWindStore((s) => s.setRepositories);
  const selectedRepositoryId = useForgeWindStore((s) => s.selectedRepositoryId);
  const setSelectedRepository = useForgeWindStore((s) => s.setSelectedRepository);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [repoInput, setRepoInput] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiConfigured = !!getForgeWindApiBaseUrl();

  /* ── Load repos from API ── */
  const { data: repos = [], isLoading } = useQuery<ForgeWindApiRepository[]>({
    queryKey: ['repositories', accessToken],
    enabled: !!accessToken && apiConfigured,
    queryFn: () => forgeWindJson<ForgeWindApiRepository[]>('/repositories', { accessToken }),
    onSuccess: (rows) => {
      const mapped = rows.map(mapForgeWindRepositoryToSummary);
      setRepositories(mapped);
      const active = rows.find((r) => r.isActive);
      const fallback = mapped[0]?.id ?? '';
      useForgeWindStore.setState({
        selectedRepositoryId: active?.id ?? fallback,
      });
    },
  });

  const mappedRepos = repos.map(mapForgeWindRepositoryToSummary);
  const selectedRepo = mappedRepos.find((r) => r.id === selectedRepositoryId);

  /* ── Connect repo ── */
  const connectMutation = useMutation({
    mutationFn: async (raw: string) => {
      const fullName = parseRepoInput(raw);
      if (!fullName.includes('/'))
        throw new Error('Enter a valid repo like owner/repo or a GitHub URL.');

      const gh = await fetchGitHubMeta(fullName);
      return forgeWindJson<ForgeWindApiRepository>('/repositories', {
        method: 'POST',
        accessToken,
        body: JSON.stringify({
          githubRepoId: String(gh.id),
          name: gh.name,
          fullName: gh.full_name,
          description: gh.description ?? '',
          language: gh.language ?? 'Unknown',
        }),
      });
    },
    onSuccess: () => {
      toast.success('Repository connected and syncing…');
      setConnectOpen(false);
      setRepoInput('');
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  /* ── Disconnect repo ── */
  const disconnectMutation = useMutation({
    mutationFn: (repoId: string) =>
      forgeWindJson<void>(`/repositories/${repoId}`, {
        method: 'DELETE',
        accessToken,
      }),
    onSuccess: (_data, repoId) => {
      toast.success('Repository disconnected.');
      if (selectedRepositoryId === repoId) {
        useForgeWindStore.setState({ selectedRepositoryId: '' });
      }
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  /* ── Sync repo ── */
  const syncRepo = async (repoId: string) => {
    setSyncingId(repoId);
    try {
      await forgeWindJson(`/repositories/${repoId}/activate`, {
        method: 'PATCH',
        accessToken,
        body: JSON.stringify({ isActive: true }),
      });
      toast.success('Sync triggered.');
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Sync failed.');
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Data Hub</h2>
          <p className="text-sm text-muted-foreground">
            Connect GitHub repositories to power your AI agents, content, and job matches.
          </p>
        </div>
        <Button
          onClick={() => {
            setConnectOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
        >
          <Plus className="h-4 w-4" />
          Connect repo
        </Button>
      </div>

      {/* Connect modal */}
      {connectOpen && (
        <Card className="p-5 border-fw-orange-mid bg-fw-orange-light/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Github className="h-5 w-5 text-fw-orange" />
              <p className="font-semibold text-foreground">Connect a GitHub repository</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setConnectOpen(false);
                setRepoInput('');
              }}
              className="rounded p-1 text-muted-foreground hover:bg-surface-light"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Paste a GitHub URL or enter <span className="font-mono">owner/repo</span>
          </p>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && connectMutation.mutate(repoInput)}
              placeholder="https://github.com/owner/repo"
              className="flex-1 rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-fw-orange"
            />
            <Button
              onClick={() => connectMutation.mutate(repoInput)}
              disabled={connectMutation.isPending || !repoInput.trim()}
            >
              {connectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect'}
            </Button>
          </div>
        </Card>
      )}

      {/* Repo list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading repositories…
        </div>
      ) : mappedRepos.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fw-orange-light">
            <Github className="h-7 w-7 text-fw-orange" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No repositories connected yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect a GitHub repo to start generating AI insights, content, and job matches.
            </p>
          </div>
          <Button
            onClick={() => {
              setConnectOpen(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
          >
            <Plus className="h-4 w-4" />
            Connect your first repo
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {mappedRepos.map((repo) => (
            <div key={repo.id} className="relative">
              <RepoCard
                repo={repo}
                selected={selectedRepositoryId === repo.id}
                onSelect={(id) => setSelectedRepository(id, accessToken)}
                onSync={syncRepo}
                isSyncing={syncingId === repo.id}
              />
              {/* Disconnect */}
              <button
                type="button"
                title="Disconnect repository"
                onClick={() => disconnectMutation.mutate(repo.id)}
                disabled={disconnectMutation.isPending}
                className="absolute right-2 top-2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-surface-light hover:text-red-500 group-hover:opacity-100 [.relative:hover_&]:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Active context + analysis drawer */}
      {mappedRepos.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Current context target</p>
              <p className="text-xs text-muted-foreground">
                {selectedRepo?.fullName ??
                  'No repository selected — click a card above to set one.'}
              </p>
            </div>
            <div className="flex gap-2">
              {selectedRepo && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => syncRepo(selectedRepo.id)}
                  disabled={syncingId === selectedRepo.id}
                >
                  {syncingId === selectedRepo.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Sync
                </Button>
              )}
              <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
                Open analysis drawer
              </Button>
            </div>
          </div>
        </Card>
      )}

      <AnalysisDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        repository={selectedRepo}
      />
    </div>
  );
}

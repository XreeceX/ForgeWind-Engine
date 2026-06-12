'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Briefcase,
  Check,
  Copy,
  FileText,
  FolderGit2,
  Linkedin,
  Loader2,
  Sparkles,
  User,
  Wand2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AIChatPanel } from '@/components/ai-studio/ai-chat-panel';
import { ContentPreviewCard } from '@/components/content/content-preview-card';
import { RepoCard } from '@/components/dashboard/repo-card';
import { JobMatchCard } from '@/components/jobs/job-match-card';
import { AgentStatePanel } from '@/components/workspace/agent-state-panel';
import { WorkModeBanner } from '@/components/workspace/work-mode-banner';
import { WorkspaceStatRow } from '@/components/workspace/workspace-stat-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { useForgeWindStore } from '@/stores/forgewind.store';
import { useForgeWindAccessToken } from '@/hooks/use-forgewind-access-token';
import {
  type ForgeWindApiNarrative,
  type ForgeWindApiOpportunityMatch,
  forgeWindJson,
  getForgeWindApiBaseUrl,
} from '@/lib/forgewind-api';
import { mapOpportunityMatchToJob } from '@/lib/forgewind-mappers';
import { cn } from '@/lib/cn';

/* ── content type definitions ───────────────────────────────── */
const CONTENT_TYPES = [
  {
    id: 'commit_story',
    label: 'LinkedIn Post',
    description: 'Turn recent commits into an engaging LinkedIn story',
    icon: Linkedin,
    channel: 'linkedin' as const,
    requiresRepo: true,
  },
  {
    id: 'project_summary',
    label: 'Project Story',
    description: 'A narrative overview of your repository & its impact',
    icon: FileText,
    channel: 'linkedin' as const,
    requiresRepo: true,
  },
  {
    id: 'bio',
    label: 'Professional Bio',
    description: 'A polished, concise bio for your portfolio or README',
    icon: User,
    channel: 'portfolio' as const,
    requiresRepo: false,
  },
  {
    id: 'profile_optimization',
    label: 'Profile Optimiser',
    description: 'Headline and improvements to sharpen your public profile',
    icon: Sparkles,
    channel: 'portfolio' as const,
    requiresRepo: false,
  },
] as const;

type ContentTypeId = (typeof CONTENT_TYPES)[number]['id'];

export function WorkModeDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const repositories = useForgeWindStore((state) => state.repositories);
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);
  const generatedContent = useForgeWindStore((state) => state.generatedContent);
  const aiAnalysis = useForgeWindStore((state) => state.aiAnalysis);
  const forgeWindUserId = useForgeWindStore((state) => state.forgeWindUserId);
  const chatOverlayOpen = useForgeWindStore((state) => state.chatOverlayOpen);
  const setSelectedRepository = useForgeWindStore((state) => state.setSelectedRepository);
  const setChatOverlayOpen = useForgeWindStore((state) => state.setChatOverlayOpen);
  const pushGeneratedContent = useForgeWindStore((state) => state.pushGeneratedContent);
  const accessToken = useForgeWindAccessToken();
  const apiReady = !!getForgeWindApiBaseUrl() && !!accessToken;

  /* ── Generate Post modal state ── */
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ContentTypeId>('commit_story');
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedRepository = useMemo(
    () => repositories.find((repo) => repo.id === selectedRepositoryId),
    [repositories, selectedRepositoryId],
  );

  const healthAvg = useMemo(() => {
    if (!repositories.length) return 0;
    return Math.round(
      repositories.reduce((acc, r) => acc + r.healthScore, 0) / repositories.length,
    );
  }, [repositories]);

  const agentPanelStatus = useMemo(() => {
    if (aiAnalysis.status === 'running') return 'running' as const;
    return 'ready' as const;
  }, [aiAnalysis.status]);

  const matchesQuery = useQuery({
    queryKey: ['forgewind-matches', forgeWindUserId],
    enabled: apiReady,
    queryFn: () => forgeWindJson<ForgeWindApiOpportunityMatch[]>('/matches', { accessToken }),
  });

  const opportunityJobs = useMemo(() => {
    if (!apiReady) return [];
    const rows = matchesQuery.data ?? [];
    return rows
      .filter((m) => m.status !== 'dismissed')
      .slice(0, 3)
      .map(mapOpportunityMatchToJob);
  }, [apiReady, matchesQuery.data]);

  /* ── Generate narrative via API ── */
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!forgeWindUserId) throw new Error('ForgeWind user not loaded yet.');
      const typeConfig = CONTENT_TYPES.find((t) => t.id === selectedType)!;
      const repoId =
        typeConfig.requiresRepo && selectedRepositoryId ? selectedRepositoryId : undefined;

      return forgeWindJson<ForgeWindApiNarrative>('/narratives/generate', {
        method: 'POST',
        accessToken,
        body: JSON.stringify({
          userId: forgeWindUserId,
          type: selectedType,
          ...(repoId ? { repoId } : {}),
        }),
      });
    },
    onSuccess: (narrative) => {
      setGeneratedResult(narrative.content);
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  function saveToLibrary() {
    if (!generatedResult) return;
    const typeConfig = CONTENT_TYPES.find((t) => t.id === selectedType)!;
    pushGeneratedContent({
      title: typeConfig.label,
      channel: typeConfig.channel,
      body: generatedResult,
    });
    toast.success('Draft saved to your content library');
    setGenerateOpen(false);
    setGeneratedResult(null);
  }

  async function copyToClipboard() {
    if (!generatedResult) return;
    await navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openGenerateModal() {
    setGeneratedResult(null);
    setSelectedType('commit_story');
    generateMutation.reset();
    setGenerateOpen(true);
  }

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = (session?.user?.name ?? '').split(' ')[0];
  const greeting = firstName ? `${timeGreeting}, ${firstName}` : 'ForgeWind workspace';

  const quickActions = [
    {
      label: 'Generate Post',
      description: 'AI-written content from your repos',
      icon: Wand2,
      onClick: openGenerateModal,
    },
    {
      label: 'Find Jobs',
      description: 'AI-matched roles for your profile',
      icon: Briefcase,
      onClick: () => router.push('/jobs'),
    },
    {
      label: 'View Insights',
      description: 'Everything the AI knows about you',
      icon: Sparkles,
      onClick: () => router.push('/memory'),
    },
    {
      label: 'Connect Repo',
      description: 'Add a GitHub repository',
      icon: FolderGit2,
      onClick: () => router.push('/data-hub'),
    },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-6"
      >
        <WorkModeBanner
          greeting={greeting}
          onOpenChat={() => setChatOverlayOpen(true)}
          onGeneratePost={openGenerateModal}
        />

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className="group rounded-fw-card border border-border bg-panel p-4 text-left shadow-sm transition-all duration-200 hover:border-fw-orange-mid hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-fw-orange-light transition-colors group-hover:bg-gradient-to-br group-hover:from-fw-orange group-hover:to-amber-400">
                <action.icon className="h-4.5 w-4.5 text-fw-orange transition-colors group-hover:text-white" />
              </div>
              <p className="mt-2.5 text-sm font-semibold text-foreground">{action.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
            </motion.button>
          ))}
        </div>

        <section className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-fw-orange">
              Repository intelligence
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Connected repos</h2>
          </div>
          {repositories.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fw-orange-light">
                <FolderGit2 className="h-6 w-6 text-fw-orange" />
              </div>
              <div>
                <p className="font-semibold text-foreground">No repositories connected</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Connect a GitHub repo to unlock AI analysis, content, and job matching.
                </p>
              </div>
              <Button size="sm" onClick={() => router.push('/data-hub')}>
                <FolderGit2 className="h-4 w-4" />
                Connect a repo
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {repositories.map((repo) => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  selected={repo.id === selectedRepositoryId}
                  onSelect={setSelectedRepository}
                />
              ))}
            </div>
          )}
        </section>

        <AgentStatePanel
          status={agentPanelStatus}
          statusLabel={`Agent engine: ${aiAnalysis.status}`}
          detail={
            selectedRepository
              ? `Analysing ${selectedRepository.fullName}`
              : 'No repository selected'
          }
          timeline={[
            {
              id: 't1',
              time: 'Now',
              label: aiAnalysis.focus
                ? `Focus: ${aiAnalysis.focus}`
                : 'Idle — sync a repository to run analysis',
            },
            {
              id: 't2',
              time: 'Context',
              label: `Active repo: ${selectedRepository?.fullName ?? 'none'}`,
            },
            ...aiAnalysis.findings.slice(0, 2).map((f, i) => ({
              id: `f-${i}`,
              time: `Finding ${i + 1}`,
              label: f,
            })),
          ]}
        />

        <WorkspaceStatRow
          repoCount={repositories.length}
          workflowCount={generatedContent.length}
          healthAvg={healthAvg}
          postsGenerated={generatedContent.length}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-fw-card border border-border bg-panel p-4 lg:col-span-2">
            <p className="text-sm font-semibold text-foreground">Generated content</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {generatedContent.slice(0, 4).map((content) => (
                <ContentPreviewCard key={content.id} content={content} />
              ))}
            </div>
          </Card>
          <Card className="rounded-fw-card border border-border bg-panel p-4">
            <p className="text-sm font-semibold text-foreground">Opportunity feed</p>
            <div className="mt-3 space-y-2">
              {!apiReady ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Briefcase className="mb-2 h-7 w-7 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    Connect the ForgeWind API to see matched opportunities.
                  </p>
                </div>
              ) : matchesQuery.isLoading ? (
                <p className="py-4 text-center text-xs text-muted-foreground">Loading…</p>
              ) : opportunityJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Briefcase className="mb-2 h-7 w-7 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    No matches yet. Sync a repository to surface opportunities.
                  </p>
                </div>
              ) : (
                opportunityJobs.map((job) => <JobMatchCard key={job.id} job={job} />)
              )}
            </div>
          </Card>
        </div>
      </motion.div>
      <Modal
        open={chatOverlayOpen}
        onClose={() => setChatOverlayOpen(false)}
        title="ForgeWind AI Copilot"
        size="lg"
      >
        <AIChatPanel selectedRepository={selectedRepository} />
      </Modal>

      {/* ── Generate Post modal ── */}
      <Modal
        open={generateOpen}
        onClose={() => {
          setGenerateOpen(false);
          setGeneratedResult(null);
          generateMutation.reset();
        }}
        title="Generate content"
        size="lg"
      >
        <div className="space-y-5">
          {/* Type picker */}
          {!generatedResult && (
            <>
              <p className="text-sm text-muted-foreground">
                Choose the type of content to generate
                {selectedRepository ? ` from ${selectedRepository.fullName}` : ''}.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {CONTENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isActive = selectedType === type.id;
                  const disabled = type.requiresRepo && !selectedRepositoryId;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        'rounded-fw-card border p-4 text-left transition-all duration-150',
                        'disabled:cursor-not-allowed disabled:opacity-40',
                        isActive
                          ? 'border-fw-orange bg-fw-orange-light/50 ring-1 ring-fw-orange'
                          : 'border-border bg-surface-light hover:border-fw-orange-mid',
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            isActive ? 'text-fw-orange' : 'text-muted-foreground',
                          )}
                        />
                        <span className="text-sm font-semibold text-foreground">{type.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                      {type.requiresRepo && !selectedRepositoryId && (
                        <p className="mt-1.5 text-[10px] font-medium text-amber-500">
                          Requires an active repository
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {!apiReady && (
                <p className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                  ForgeWind API is not configured — generation will not work until the backend is
                  connected.
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending || !apiReady || !forgeWindUserId}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Result */}
          {generatedResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <p className="text-sm font-semibold text-foreground">Content generated</p>
              </div>
              <div className="rounded-fw-card border border-border bg-surface-light p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {generatedResult}
              </div>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setGeneratedResult(null);
                    generateMutation.reset();
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ← Try again
                </button>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={copyToClipboard}>
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button size="sm" onClick={saveToLibrary}>
                    Save to library
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

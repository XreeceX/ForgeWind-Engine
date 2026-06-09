'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { AIChatPanel } from '@/components/ai-studio/ai-chat-panel';
import { ContentPreviewCard } from '@/components/content/content-preview-card';
import { RepoCard } from '@/components/dashboard/repo-card';
import { JobMatchCard } from '@/components/jobs/job-match-card';
import { AgentStatePanel } from '@/components/workspace/agent-state-panel';
import { WorkModeBanner } from '@/components/workspace/work-mode-banner';
import { WorkspaceStatRow } from '@/components/workspace/workspace-stat-row';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { useForgeWindStore } from '@/stores/forgewind.store';
import { useForgeWindAccessToken } from '@/hooks/use-forgewind-access-token';
import {
  type ForgeWindApiOpportunityMatch,
  forgeWindJson,
  getForgeWindApiBaseUrl,
} from '@/lib/forgewind-api';
import { mapOpportunityMatchToJob } from '@/lib/forgewind-mappers';

export function WorkModeDashboard() {
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

  function onGeneratePost() {
    pushGeneratedContent({
      title: 'Building resilient APIs in product teams',
      channel: 'linkedin',
      body: `Generated from ${selectedRepository?.fullName ?? 'career context'} with an emphasis on measurable outcomes and architecture thinking.`,
    });
    toast.success('Draft saved to your content library', { duration: 4000 });
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-6"
      >
        <WorkModeBanner
          onOpenChat={() => setChatOverlayOpen(true)}
          onGeneratePost={onGeneratePost}
        />

        <section className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-fw-orange">
              Repository intelligence
            </p>
            <h2 className="mt-1 text-lg font-semibold text-fw-gray-900">Connected repos</h2>
          </div>
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
          <Card className="rounded-fw-card border border-fw-gray-100 bg-fw-white p-4 lg:col-span-2">
            <p className="text-sm font-semibold text-fw-gray-900">Generated content</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {generatedContent.slice(0, 4).map((content) => (
                <ContentPreviewCard key={content.id} content={content} />
              ))}
            </div>
          </Card>
          <Card className="rounded-fw-card border border-fw-gray-100 bg-fw-white p-4">
            <p className="text-sm font-semibold text-fw-gray-900">Opportunity feed</p>
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
    </>
  );
}

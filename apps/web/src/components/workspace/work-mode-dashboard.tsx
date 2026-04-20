"use client";

import { motion } from "framer-motion";
import { AIChatPanel } from "@/components/ai-studio/ai-chat-panel";
import { ContentPreviewCard } from "@/components/content/content-preview-card";
import { RepoCard } from "@/components/dashboard/repo-card";
import { JobMatchCard, type JobMatch } from "@/components/jobs/job-match-card";
import { AgentStatePanel } from "@/components/workspace/agent-state-panel";
import { WorkModeBanner } from "@/components/workspace/work-mode-banner";
import { WorkspaceStatRow } from "@/components/workspace/workspace-stat-row";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useForgeWindStore } from "@/stores/forgewind.store";
import { useMemo } from "react";
import toast from "react-hot-toast";

const JOB_MATCHES: JobMatch[] = [
  {
    id: "j-1",
    title: "Senior Platform Engineer",
    company: "Arcadian Labs",
    location: "Remote",
    matchScore: 91,
    reason: "Strong reliability and architecture signal from your selected repos.",
  },
  {
    id: "j-2",
    title: "Staff Backend Engineer",
    company: "Flowmint",
    location: "London / Hybrid",
    matchScore: 86,
    reason: "AI scored your narrative as a high-fit for cross-team technical leadership.",
  },
];

export function WorkModeDashboard() {
  const repositories = useForgeWindStore((state) => state.repositories);
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);
  const generatedContent = useForgeWindStore((state) => state.generatedContent);
  const aiAnalysis = useForgeWindStore((state) => state.aiAnalysis);
  const chatOverlayOpen = useForgeWindStore((state) => state.chatOverlayOpen);
  const setSelectedRepository = useForgeWindStore((state) => state.setSelectedRepository);
  const setChatOverlayOpen = useForgeWindStore((state) => state.setChatOverlayOpen);
  const pushGeneratedContent = useForgeWindStore((state) => state.pushGeneratedContent);

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
    if (aiAnalysis.status === "running") return "running" as const;
    return "ready" as const;
  }, [aiAnalysis.status]);

  function onGeneratePost() {
    pushGeneratedContent({
      title: "Building resilient APIs in product teams",
      channel: "linkedin",
      body: `Generated from ${selectedRepository?.fullName ?? "career context"} with an emphasis on measurable outcomes and architecture thinking.`,
    });
    toast.success("Draft saved to your content library", { duration: 4000 });
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
          statusLabel={`Status: ${aiAnalysis.status} — particles canvas active behind hero`}
          detail="Animated: 60 orange dots drifting + connecting lines on canvas"
          timeline={[
            {
              id: "t1",
              time: "Just now",
              label: `Focus: ${aiAnalysis.focus}`,
            },
            {
              id: "t2",
              time: "Recent",
              label: `Selected repo: ${selectedRepository?.fullName ?? "none"}`,
            },
            ...aiAnalysis.findings.slice(0, 2).map((f, i) => ({
              id: `f-${i}`,
              time: `${(i + 1) * 3}m ago`,
              label: f,
            })),
          ]}
        />

        <WorkspaceStatRow
          repoCount={repositories.length}
          workflowCount={5}
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
              {JOB_MATCHES.map((job) => (
                <JobMatchCard key={job.id} job={job} />
              ))}
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

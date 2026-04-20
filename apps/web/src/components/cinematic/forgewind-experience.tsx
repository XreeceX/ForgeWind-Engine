"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BrainCircuit, BriefcaseBusiness, Layers, Sparkles, UserRound, WandSparkles } from "lucide-react";
import { AIChatPanel } from "@/components/ai-studio/ai-chat-panel";
import { AIFlowVisualization } from "@/components/cinematic/AIFlowVisualization";
import { AnimatedTextReveal } from "@/components/cinematic/AnimatedTextReveal";
import { DepthBackground } from "@/components/cinematic/DepthBackground";
import { FloatingCard } from "@/components/cinematic/FloatingCard";
import { ScrollSection } from "@/components/cinematic/ScrollSection";
import { ContentPreviewCard } from "@/components/content/content-preview-card";
import { RepoCard } from "@/components/dashboard/repo-card";
import { JobMatchCard, type JobMatch } from "@/components/jobs/job-match-card";
import { ForgeWindLogo } from "@/components/brand/forgewind-logo";
import { AppShell } from "@/components/layout/app-shell";
import { AgentStatePanel } from "@/components/workspace/agent-state-panel";
import { WorkModeBanner } from "@/components/workspace/work-mode-banner";
import { WorkspaceStatRow } from "@/components/workspace/workspace-stat-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useForgeWindStore, type NarrativeSectionId } from "@/stores/forgewind.store";
import toast from "react-hot-toast";

gsap.registerPlugin(ScrollTrigger);

const SECTION_ORDER: NarrativeSectionId[] = [
  "identity",
  "data",
  "analysis",
  "output",
  "creation",
  "opportunity",
];

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

export function ForgeWindExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const repositories = useForgeWindStore((state) => state.repositories);
  const userProfile = useForgeWindStore((state) => state.userProfile);
  const memoryContext = useForgeWindStore((state) => state.memoryContext);
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);
  const generatedContent = useForgeWindStore((state) => state.generatedContent);
  const aiAnalysis = useForgeWindStore((state) => state.aiAnalysis);
  const uiMode = useForgeWindStore((state) => state.uiMode);
  const activeNarrativeSection = useForgeWindStore((state) => state.activeNarrativeSection);
  const chatOverlayOpen = useForgeWindStore((state) => state.chatOverlayOpen);
  const setSelectedRepository = useForgeWindStore((state) => state.setSelectedRepository);
  const setUIMode = useForgeWindStore((state) => state.setUIMode);
  const setActiveNarrativeSection = useForgeWindStore((state) => state.setActiveNarrativeSection);
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

  useLayoutEffect(() => {
    if (!containerRef.current || uiMode !== "cinematic") return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
        onUpdate: ({ progress }) => setScrollProgress(progress),
      });

      SECTION_ORDER.forEach((section) => {
        const selector = `[data-section="${section}"]`;
        ScrollTrigger.create({
          trigger: selector,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveNarrativeSection(section),
          onEnterBack: () => setActiveNarrativeSection(section),
        });

        gsap.fromTo(
          `${selector} .section-copy`,
          { opacity: 0.35, y: 34 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: selector,
              start: "top 76%",
              end: "top 32%",
              scrub: true,
            },
          },
        );

        gsap.fromTo(
          `${selector} .section-card`,
          { opacity: 0.45, y: 42, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: selector,
              start: "top 74%",
              end: "top 35%",
              scrub: true,
            },
          },
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [setActiveNarrativeSection, uiMode]);

  function onGeneratePost() {
    pushGeneratedContent({
      title: "Building resilient APIs in product teams",
      channel: "linkedin",
      body: `Generated from ${selectedRepository?.fullName ?? "career context"} with an emphasis on measurable outcomes and architecture thinking.`,
    });
    toast.success("Draft saved to your content library", { duration: 4000 });
  }

  if (uiMode === "work") {
    return (
      <AppShell>
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6"
        >
          <WorkModeBanner
            onOpenChat={() => setChatOverlayOpen(true)}
            onGeneratePost={onGeneratePost}
            onCinematic={() => setUIMode("cinematic")}
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
      </AppShell>
    );
  }

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-clip pb-16">
      <DepthBackground />

      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-primary-100/90">
        <motion.div className="h-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ scaleX: scrollProgress, transformOrigin: "0% 50%" }} />
      </div>

      <div className="fixed left-4 top-5 z-50 flex items-center gap-2 rounded-full border border-border-light bg-panel/95 px-2 py-1.5 shadow-sm backdrop-blur-xl">
        <div className="overflow-hidden rounded-lg ring-1 ring-border/60">
          <ForgeWindLogo size={28} priority />
        </div>
        <span className="hidden pr-1 text-sm font-semibold text-foreground sm:inline">ForgeWind</span>
      </div>

      <div className="fixed right-4 top-5 z-50 flex items-center gap-2 rounded-full border border-border-light bg-panel/95 p-1 shadow-sm backdrop-blur-xl">
        <Button size="sm" variant="primary" onClick={() => setUIMode("cinematic")}>
          Cinematic Mode
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setUIMode("work")}>
          Work Mode
        </Button>
      </div>

      <header className="section-copy px-6 pb-10 pt-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.25em] text-primary-600">ForgeWind · AIML career OS</p>
          <AnimatedTextReveal
            text="A scroll-driven model-forward operating system that turns profile and repo signal into strategic career momentum."
            className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-foreground md:text-6xl"
          />
        </div>
      </header>

      <main>
        <ScrollSection
          id="identity"
          label="Identity Layer"
          title="Who is the user?"
          description="ForgeWind starts by grounding every decision in your profile, role target, and narrative intent."
          active={activeNarrativeSection === "identity"}
        >
          <div className="section-card grid h-full gap-3">
            <FloatingCard>
              <p className="text-xs uppercase tracking-[0.18em] text-primary-600">Profile</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{userProfile.name}</p>
              <p className="text-sm text-muted-foreground">{userProfile.role}</p>
              <p className="mt-3 text-sm text-muted-foreground">{userProfile.headline}</p>
            </FloatingCard>
            <FloatingCard delay={0.08}>
              <p className="text-xs uppercase tracking-[0.18em] text-accent-600">Career Goal</p>
              <p className="mt-2 text-sm text-foreground">{userProfile.primaryGoal}</p>
              <p className="mt-2 text-sm text-muted-foreground">Narrative: {memoryContext.careerNarrative}</p>
            </FloatingCard>
          </div>
        </ScrollSection>

        <ScrollSection
          id="data"
          label="Data Layer"
          title="Ingesting GitHub, resume, and portfolio signals"
          description="Scroll reveals data connectors, repository context, and profile assets entering the AI memory graph."
          active={activeNarrativeSection === "data"}
        >
          <div className="section-card grid gap-3">
            {repositories.map((repo, index) => (
              <FloatingCard key={repo.id} delay={index * 0.06}>
                <button className="w-full text-left" onClick={() => setSelectedRepository(repo.id)}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{repo.fullName}</p>
                    <span className="text-xs text-muted-foreground">{repo.language}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{repo.summary}</p>
                </button>
              </FloatingCard>
            ))}
          </div>
        </ScrollSection>

        <ScrollSection
          id="analysis"
          label="Intelligence Layer"
          title="AI reasoning and repository understanding"
          description="The analysis engine parses architecture patterns, impact language, and role-fit signals in real time."
          active={activeNarrativeSection === "analysis"}
        >
          <div className="section-card">
            <AIFlowVisualization
              stageLabel="Reasoning flow"
              points={[
                `Parsing repository: ${selectedRepository?.fullName ?? "Select repository"}`,
                "Mapping commits to skills and role expectations",
                "Scoring narrative gaps and differentiation opportunities",
              ]}
            />
          </div>
        </ScrollSection>

        <ScrollSection
          id="output"
          label="Intelligence Output"
          title="Skills map and career gap visibility"
          description="Insights become structured recommendations that can immediately shape your profile and outbound content."
          active={activeNarrativeSection === "output"}
        >
          <div className="section-card grid gap-3">
            <FloatingCard>
              <p className="text-xs uppercase tracking-[0.18em] text-primary-600">Strength map</p>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                {memoryContext.strengths.map((strength) => (
                  <li key={strength}>- {strength}</li>
                ))}
              </ul>
            </FloatingCard>
            <FloatingCard delay={0.08}>
              <p className="text-xs uppercase tracking-[0.18em] text-warning">Growth gaps</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {memoryContext.gaps.map((gap) => (
                  <li key={gap}>- {gap}</li>
                ))}
              </ul>
            </FloatingCard>
          </div>
        </ScrollSection>

        <ScrollSection
          id="creation"
          label="Creation Layer"
          title="Generate LinkedIn posts and article drafts"
          description="Turn analysis into polished content artifacts with one click, while preserving your career voice."
          active={activeNarrativeSection === "creation"}
        >
          <div className="section-card space-y-3">
            <FloatingCard>
              <p className="text-xs uppercase tracking-[0.18em] text-primary-600">AI content studio</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Drafts are grounded in the selected repository and optimization targets.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={onGeneratePost}>
                  Generate Post
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setChatOverlayOpen(true)}>
                  Open AI Chat
                </Button>
              </div>
            </FloatingCard>
            {generatedContent.slice(0, 2).map((content) => (
              <ContentPreviewCard key={content.id} content={content} />
            ))}
          </div>
        </ScrollSection>

        <ScrollSection
          id="opportunity"
          label="Opportunity Layer"
          title="Jobs and recommendations become actionable"
          description="The final layer surfaces opportunities with role-fit explanations and next actions for momentum."
          active={activeNarrativeSection === "opportunity"}
        >
          <div className="section-card space-y-3">
            {JOB_MATCHES.map((job, index) => (
              <FloatingCard key={job.id} delay={index * 0.08}>
                <JobMatchCard job={job} />
              </FloatingCard>
            ))}
          </div>
        </ScrollSection>
      </main>

      <div className="fixed bottom-5 left-5 z-40 rounded-xl border border-border-light bg-panel/95 px-4 py-3 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Layers className="h-4 w-4 text-primary-600" />
          <span className={activeNarrativeSection === "identity" ? "font-semibold text-foreground" : ""}>
            <UserRound className="mr-1 inline h-3.5 w-3.5" />
            Identity
          </span>
          <span className={activeNarrativeSection === "data" ? "font-semibold text-foreground" : ""}>
            <Sparkles className="mr-1 inline h-3.5 w-3.5" />
            Data
          </span>
          <span className={activeNarrativeSection === "analysis" ? "font-semibold text-foreground" : ""}>
            <BrainCircuit className="mr-1 inline h-3.5 w-3.5" />
            Analysis
          </span>
          <span className={activeNarrativeSection === "creation" ? "font-semibold text-foreground" : ""}>
            <WandSparkles className="mr-1 inline h-3.5 w-3.5" />
            Creation
          </span>
          <span className={activeNarrativeSection === "opportunity" ? "font-semibold text-foreground" : ""}>
            <BriefcaseBusiness className="mr-1 inline h-3.5 w-3.5" />
            Opportunity
          </span>
        </div>
      </div>

      <Modal
        open={chatOverlayOpen}
        onClose={() => setChatOverlayOpen(false)}
        title="ForgeWind AI Copilot"
        size="lg"
      >
        <AIChatPanel selectedRepository={selectedRepository} />
      </Modal>
    </div>
  );
}

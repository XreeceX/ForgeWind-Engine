"use client";

import { AIChatPanel } from "@/components/ai-studio/ai-chat-panel";
import { AnalysisCard } from "@/components/ai-studio/analysis-card";
import { ContextPanel } from "@/components/ai-studio/context-panel";
import { InsightCard } from "@/components/ai-studio/insight-card";
import { useCareerOSStore } from "@/stores/careeros.store";

export default function AIStudioPage() {
  const userProfile = useCareerOSStore((state) => state.userProfile);
  const memoryContext = useCareerOSStore((state) => state.memoryContext);
  const aiAnalysis = useCareerOSStore((state) => state.aiAnalysis);
  const repositories = useCareerOSStore((state) => state.repositories);
  const selectedRepositoryId = useCareerOSStore((state) => state.selectedRepositoryId);

  const selectedRepository = repositories.find((repo) => repo.id === selectedRepositoryId);

  return (
    <div className="grid gap-6 xl:grid-cols-12">
      <section className="space-y-4 xl:col-span-8">
        <AIChatPanel selectedRepository={selectedRepository} />
      </section>
      <aside className="space-y-4 xl:col-span-4">
        <ContextPanel userProfile={userProfile} selectedRepository={selectedRepository} memoryContext={memoryContext} />
        <AnalysisCard analysis={aiAnalysis} />
        <InsightCard
          title="Recommendation"
          insight={`Tie ${selectedRepository?.name ?? "your active repository"} outcomes to leadership-level impact statements.`}
        />
      </aside>
    </div>
  );
}

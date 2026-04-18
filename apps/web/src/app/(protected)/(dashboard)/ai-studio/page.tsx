"use client";

import { AIChatPanel } from "@/components/ai-studio/ai-chat-panel";
import { AnalysisCard } from "@/components/ai-studio/analysis-card";
import { ContextPanel } from "@/components/ai-studio/context-panel";
import { InsightCard } from "@/components/ai-studio/insight-card";
import { useForgeWindStore } from "@/stores/forgewind.store";

export default function AIStudioPage() {
  const userProfile = useForgeWindStore((state) => state.userProfile);
  const memoryContext = useForgeWindStore((state) => state.memoryContext);
  const aiAnalysis = useForgeWindStore((state) => state.aiAnalysis);
  const repositories = useForgeWindStore((state) => state.repositories);
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);

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

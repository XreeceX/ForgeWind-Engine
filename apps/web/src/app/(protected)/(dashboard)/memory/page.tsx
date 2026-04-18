"use client";

import { MemoryInsightCard, type MemoryInsight } from "@/components/memory/memory-insight-card";
import { Card } from "@/components/ui/card";
import { useCareerOSStore } from "@/stores/careeros.store";

export default function MemoryPage() {
  const memoryContext = useCareerOSStore((state) => state.memoryContext);
  const repositories = useCareerOSStore((state) => state.repositories);
  const selectedRepositoryId = useCareerOSStore((state) => state.selectedRepositoryId);

  const selectedRepository = repositories.find((repo) => repo.id === selectedRepositoryId);

  const insights: MemoryInsight[] = [
    {
      id: "memory-1",
      title: "Career narrative",
      detail: memoryContext.careerNarrative,
      updatedAt: "Updated recently",
    },
    {
      id: "memory-2",
      title: "Current strengths",
      detail: memoryContext.strengths.join(", "),
      updatedAt: "Synced from profile",
    },
    {
      id: "memory-3",
      title: "Repository-linked gap",
      detail: `For ${selectedRepository?.name ?? "your selected repository"}, communicate more measurable impact to close leadership storytelling gaps.`,
      updatedAt: "Derived from AI analysis",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <p className="text-sm font-semibold text-white">Persistent memory context</p>
        <p className="text-xs text-slate-400">Used by AI Studio and Content to keep outputs context-aware and consistent.</p>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {insights.map((insight) => (
          <MemoryInsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}

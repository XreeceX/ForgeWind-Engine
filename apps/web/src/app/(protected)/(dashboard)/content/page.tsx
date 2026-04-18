"use client";

import { ContentPreviewCard } from "@/components/content/content-preview-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCareerOSStore } from "@/stores/careeros.store";

export default function ContentPage() {
  const generatedContent = useCareerOSStore((state) => state.generatedContent);
  const selectedRepositoryId = useCareerOSStore((state) => state.selectedRepositoryId);
  const repositories = useCareerOSStore((state) => state.repositories);
  const pushGeneratedContent = useCareerOSStore((state) => state.pushGeneratedContent);

  const selectedRepository = repositories.find((repo) => repo.id === selectedRepositoryId);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Context-aware content generation</p>
            <p className="text-xs text-slate-400">
              Current source: {selectedRepository?.fullName ?? "no repository selected"}
            </p>
          </div>
          <Button
            onClick={() =>
              pushGeneratedContent({
                title: `Repository highlight: ${selectedRepository?.name ?? "general profile update"}`,
                channel: "linkedin",
                body: `Today I translated lessons from ${selectedRepository?.fullName ?? "my recent work"} into a practical hiring narrative focused on measurable outcomes.`,
              })
            }
          >
            Generate new preview
          </Button>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {generatedContent.map((item) => (
          <ContentPreviewCard key={item.id} content={item} />
        ))}
      </div>
    </div>
  );
}

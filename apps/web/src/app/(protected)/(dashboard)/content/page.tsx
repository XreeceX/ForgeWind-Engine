"use client";

import { ContentPreviewCard } from "@/components/content/content-preview-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useForgeWindStore } from "@/stores/forgewind.store";

export default function ContentPage() {
  const generatedContent = useForgeWindStore((state) => state.generatedContent);
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);
  const repositories = useForgeWindStore((state) => state.repositories);
  const pushGeneratedContent = useForgeWindStore((state) => state.pushGeneratedContent);

  const selectedRepository = repositories.find((repo) => repo.id === selectedRepositoryId);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Context-aware content generation</p>
            <p className="text-xs text-muted-foreground">
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

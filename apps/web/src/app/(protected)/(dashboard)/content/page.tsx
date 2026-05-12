"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ContentPreviewCard } from "@/components/content/content-preview-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  type ForgeWindApiNarrative,
  forgeWindJson,
  getForgeWindApiBaseUrl,
} from "@/lib/forgewind-api";
import { mapNarrativeToGeneratedItem } from "@/lib/forgewind-mappers";
import type { GeneratedContentItem } from "@/stores/forgewind.store";
import { useForgeWindStore } from "@/stores/forgewind.store";

const narrativeTypes = ["bio", "project_summary", "commit_story"] as const;

export default function ContentPage() {
  const forgeWindUserId = useForgeWindStore((state) => state.forgeWindUserId);
  const generatedContent = useForgeWindStore((state) => state.generatedContent);
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);
  const repositories = useForgeWindStore((state) => state.repositories);
  const pushGeneratedContent = useForgeWindStore((state) => state.pushGeneratedContent);

  const selectedRepository = repositories.find((repo) => repo.id === selectedRepositoryId);
  const [narrativeType, setNarrativeType] =
    useState<(typeof narrativeTypes)[number]>("project_summary");

  const apiReady = !!getForgeWindApiBaseUrl() && !!forgeWindUserId;
  const queryClient = useQueryClient();

  const narrativesQuery = useQuery({
    queryKey: ["forgewind-narratives", forgeWindUserId],
    enabled: apiReady,
    queryFn: () =>
      forgeWindJson<ForgeWindApiNarrative[]>("/narratives", {
        userId: forgeWindUserId,
      }),
  });

  const generateMutation = useMutation({
    mutationFn: async () =>
      forgeWindJson<ForgeWindApiNarrative>("/narratives/generate", {
        method: "POST",
        userId: forgeWindUserId!,
        body: JSON.stringify({
          userId: forgeWindUserId,
          repoId: selectedRepositoryId || undefined,
          type: narrativeType,
        }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["forgewind-narratives"] });
      toast.success("Narrative generated");
    },
    onError: () => {
      toast.error("Narrative generation failed.");
    },
  });

  const pinMutation = useMutation({
    mutationFn: async (input: { id: string; isPinned: boolean }) =>
      forgeWindJson<ForgeWindApiNarrative>(`/narratives/${input.id}/pin`, {
        method: "PATCH",
        userId: forgeWindUserId!,
        body: JSON.stringify({ isPinned: input.isPinned }),
      }),
    onSuccess: (_, vars) => {
      toast.success(vars.isPinned ? "Narrative pinned" : "Narrative unpinned");
      void queryClient.invalidateQueries({ queryKey: ["forgewind-narratives"] });
    },
    onError: () => {
      toast.error("Could not update pin state.");
    },
  });

  const apiItems: GeneratedContentItem[] = useMemo(() => {
    if (!narrativesQuery.data) return [];
    return narrativesQuery.data.map(mapNarrativeToGeneratedItem);
  }, [narrativesQuery.data]);

  const combined: GeneratedContentItem[] = useMemo(() => {
    const byId = new Map<string, GeneratedContentItem>();
    for (const item of apiItems) byId.set(item.id, item);
    for (const item of generatedContent) {
      if (!byId.has(item.id)) byId.set(item.id, item);
    }
    return [...byId.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [apiItems, generatedContent]);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Context-aware content generation
            </p>
            <p className="text-xs text-muted-foreground">
              Current source: {selectedRepository?.fullName ?? "no repository selected"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {apiReady ? (
              <>
                <select
                  aria-label="Narrative type"
                  value={narrativeType}
                  onChange={(e) =>
                    setNarrativeType(e.target.value as (typeof narrativeTypes)[number])
                  }
                  className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                >
                  {narrativeTypes.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  disabled={
                    generateMutation.isPending ||
                    narrativesQuery.isLoading ||
                    Boolean(narrativesQuery.isError)
                  }
                  onClick={() => generateMutation.mutate()}
                >
                  {generateMutation.isPending ? "Generating…" : "Generate (API)"}
                </Button>
              </>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                pushGeneratedContent({
                  title: `Repository highlight: ${selectedRepository?.name ?? "general profile update"}`,
                  channel: "linkedin",
                  body: `Today I translated lessons from ${selectedRepository?.fullName ?? "my recent work"} into a practical hiring narrative focused on measurable outcomes.`,
                })
              }
            >
              Local preview
            </Button>
          </div>
        </div>
        {!apiReady ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Configure <code className="rounded bg-muted px-1">NEXT_PUBLIC_FORGEWIND_API_URL</code>{" "}
            and <code className="rounded bg-muted px-1">ANTHROPIC_API_KEY</code> on the API to
            enable AI narratives.
          </p>
        ) : narrativesQuery.isError ? (
          <p className="mt-3 text-xs text-red-600">Could not load narratives from the API.</p>
        ) : generateMutation.isError ? (
          <p className="mt-3 text-xs text-red-600">
            Generation failed — check Anthropic credentials on the API.
          </p>
        ) : null}
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {combined.map((item) => {
          const narrative = narrativesQuery.data?.find((n) => n.id === item.id);
          const isPinned = Boolean(narrative?.isPinned);
          return (
            <ContentPreviewCard
              key={item.id}
              content={item}
              actions={
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant={isPinned ? "primary" : "secondary"}
                    disabled={!narrative || pinMutation.isPending}
                    onClick={() => {
                      if (!narrative) return;
                      pinMutation.mutate({
                        id: narrative.id,
                        isPinned: !narrative.isPinned,
                      });
                    }}
                  >
                    {isPinned ? "Pinned" : "Pin"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(item.body);
                        toast.success("Copied to clipboard");
                      } catch {
                        toast.error("Clipboard copy failed");
                      }
                    }}
                  >
                    Copy
                  </Button>
                </>
              }
            />
          );
        })}
      </div>
    </div>
  );
}

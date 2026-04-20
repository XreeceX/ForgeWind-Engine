"use client";

import { useMemo } from "react";
import { JobMatchCard, type JobMatch } from "@/components/jobs/job-match-card";
import { Card } from "@/components/ui/card";
import { useForgeWindStore } from "@/stores/forgewind.store";

export default function JobsPage() {
  const repositories = useForgeWindStore((state) => state.repositories);
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);
  const selectedRepository = repositories.find((repo) => repo.id === selectedRepositoryId);

  const matches = useMemo<JobMatch[]>(() => {
    const language = selectedRepository?.language ?? "TypeScript";
    const baseScore = selectedRepository?.healthScore ?? 72;
    return [
      {
        id: "job-1",
        title: "Senior Backend Engineer",
        company: "Stripe",
        location: "Remote",
        matchScore: Math.min(97, baseScore + 8),
        reason: `Strong alignment with ${language} ownership and systems reliability experience.`,
      },
      {
        id: "job-2",
        title: "Platform Engineer",
        company: "Datadog",
        location: "New York, NY",
        matchScore: Math.min(94, baseScore + 5),
        reason: "Repository commits show operational maturity and architecture depth.",
      },
      {
        id: "job-3",
        title: "Staff Software Engineer",
        company: "Notion",
        location: "San Francisco, CA",
        matchScore: Math.min(91, baseScore + 3),
        reason: "Public technical narratives indicate senior-level communication and delivery.",
      },
    ];
  }, [selectedRepository]);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <p className="text-sm font-semibold text-foreground">Role matching context</p>
        <p className="text-xs text-muted-foreground">
          Matches are personalized from: {selectedRepository?.fullName ?? "No repository selected"}
        </p>
      </Card>

      <div className="space-y-3">
        {matches.map((job) => (
          <JobMatchCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

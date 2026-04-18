"use client";

import { useState } from "react";
import { RepoCard } from "@/components/dashboard/repo-card";
import { AnalysisDrawer } from "@/components/data-hub/analysis-drawer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useForgeWindStore } from "@/stores/forgewind.store";

export default function DataHubPage() {
  const repositories = useForgeWindStore((state) => state.repositories);
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);
  const setSelectedRepository = useForgeWindStore((state) => state.setSelectedRepository);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedRepo = repositories.find((repo) => repo.id === selectedRepositoryId);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <p className="text-sm font-semibold text-white">Repository context sources</p>
        <p className="text-sm text-slate-400">
          Select a repository to update context across AI Studio, Content, Jobs, and Memory.
        </p>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {repositories.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            selected={selectedRepositoryId === repo.id}
            onSelect={setSelectedRepository}
          />
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Current context target</p>
            <p className="text-xs text-slate-400">{selectedRepo?.fullName ?? "No repository selected"}</p>
          </div>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            Open analysis drawer
          </Button>
        </div>
      </Card>

      <AnalysisDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} repository={selectedRepo} />
    </div>
  );
}

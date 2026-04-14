"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { RepoCard } from "@/components/dashboard/repo-card";
import { OverviewStatGrid } from "@/components/dashboard/overview-stat-grid";
import { InsightCard } from "@/components/ai-studio/insight-card";
import { Card } from "@/components/ui/card";
import { useCareerOSStore } from "@/stores/careeros.store";

export default function OverviewPage() {
  const repositories = useCareerOSStore((state) => state.repositories);
  const selectedRepositoryId = useCareerOSStore((state) => state.selectedRepositoryId);
  const setSelectedRepository = useCareerOSStore((state) => state.setSelectedRepository);
  const generatedContent = useCareerOSStore((state) => state.generatedContent);

  const healthQuery = useQuery({
    queryKey: ["career-health", selectedRepositoryId],
    queryFn: async () => {
      const selected = repositories.find((repo) => repo.id === selectedRepositoryId);
      const scoreBase = selected?.healthScore ?? 70;
      return {
        score: Math.min(98, scoreBase + 7),
        confidence: Math.min(96, scoreBase + 5),
      };
    },
  });

  return (
    <div className="space-y-6">
      <OverviewStatGrid repoCount={repositories.length} contentCount={generatedContent.length} />

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="xl:col-span-2"
        >
          <Card className="cinematic-card p-5">
          <p className="text-sm font-semibold text-white">Repository intelligence</p>
          <p className="mb-4 text-xs text-slate-400">Select a repository to scope every AI panel across CareerOS.</p>
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
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="cinematic-card rounded-xl">
            <InsightCard
              title="Pipeline confidence"
              insight={`Analysis confidence is ${healthQuery.data?.confidence ?? 0}%. Selected repository health drives job and content fit scoring.`}
            />
          </div>
          <div className="cinematic-card rounded-xl">
            <InsightCard
              title="Career score trend"
              insight={`Current score: ${healthQuery.data?.score ?? 0}. Improve with more quantified outcomes and architecture-focused content.`}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

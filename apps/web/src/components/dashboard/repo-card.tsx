"use client";

import { GitFork, Loader2, RefreshCw, Star } from "lucide-react";
import { motion } from "framer-motion";
import { HealthRing } from "@/components/workspace/health-ring";
import type { RepositorySummary } from "@/stores/forgewind.store";
import { cn } from "@/lib/cn";

interface RepoCardProps {
  repo: RepositorySummary;
  selected?: boolean;
  onSelect?: (repoId: string) => void;
  onSync?: (repoId: string) => void;
  isSyncing?: boolean;
}

export function RepoCard({
  repo,
  selected = false,
  onSelect,
  onSync,
  isSyncing = false,
}: RepoCardProps) {
  return (
    <motion.button
      type="button"
      layout
      onClick={() => onSelect?.(repo.id)}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        "group w-full rounded-fw-card border border-fw-gray-100 bg-fw-white p-4 text-left",
        "shadow-sm transition-shadow duration-200",
        "hover:border-l-[3px] hover:border-l-fw-orange hover:shadow-fw-card-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fw-orange focus-visible:ring-offset-2",
        selected && "border-l-[3px] border-l-fw-orange bg-fw-orange-light/40 ring-1 ring-fw-orange-mid",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-sm font-semibold text-fw-gray-900">{repo.fullName}</p>
          <p className="mt-1 text-xs text-fw-gray-400">{repo.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-fw-orange-light px-2 py-0.5 text-xs font-medium text-fw-orange">
              {repo.language}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-fw-gray-400">
              <Star className="h-3.5 w-3.5" />
              {repo.stars}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-fw-gray-400">
              <GitFork className="h-3.5 w-3.5" />
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#16A34A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
              Active
            </span>
          </div>
          {onSync ? (
            <button
              type="button"
              aria-label={`Sync repository ${repo.name}`}
              disabled={isSyncing}
              onClick={(event) => {
                event.stopPropagation();
                onSync(repo.id);
              }}
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 rounded-md border border-fw-orange-mid px-2 py-1 text-xs font-medium text-fw-orange",
                "transition-colors hover:bg-fw-orange-light/80 disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              {isSyncing ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 shrink-0" />
              )}
              Sync GitHub
            </button>
          ) : null}
        </div>
        <HealthRing score={repo.healthScore} size={64} />
      </div>
    </motion.button>
  );
}

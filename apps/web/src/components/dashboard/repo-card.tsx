import { GitFork, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { RepositorySummary } from "@/stores/forgewind.store";
import { cn } from "@/lib/cn";

interface RepoCardProps {
  repo: RepositorySummary;
  selected?: boolean;
  onSelect?: (repoId: string) => void;
}

export function RepoCard({ repo, selected = false, onSelect }: RepoCardProps) {
  return (
    <button className="w-full text-left" onClick={() => onSelect?.(repo.id)}>
      <Card
        className={cn(
          "p-4 transition-all duration-200",
          selected
            ? "border-primary-500/40 bg-primary-500/8 shadow-glow-primary"
            : "hover:border-border-light hover:bg-panel-elevated",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{repo.fullName}</p>
            <p className="mt-1 text-xs text-slate-400">{repo.summary}</p>
          </div>
          <Badge variant={repo.healthScore >= 85 ? "success" : "warning"}>{repo.healthScore} health</Badge>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {repo.stars}
          </span>
          <span>{repo.language}</span>
          <span className="inline-flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" />
            Active
          </span>
        </div>
      </Card>
    </button>
  );
}

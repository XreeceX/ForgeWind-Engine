import { Building2, ExternalLink, MapPin, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  reason: string;
  url?: string | null;
  status?: string;
}

interface JobMatchCardProps {
  job: JobMatch;
  showActions?: boolean;
  onSave?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function JobMatchCard({
  job,
  showActions = false,
  onSave,
  onDismiss,
}: JobMatchCardProps) {
  const variant =
    job.matchScore >= 85 ? "success" : job.matchScore >= 70 ? "primary" : "warning";

  const actionsVisible =
    showActions &&
    job.status === "new" &&
    typeof onSave === "function" &&
    typeof onDismiss === "function";

  return (
    <Card className="rounded-fw-card border border-fw-gray-100 bg-fw-white p-4 transition-all duration-200 hover:border-fw-orange-mid hover:bg-fw-orange-light/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fw-gray-900">{job.title}</p>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-fw-gray-400">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {job.company}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
            {job.url ? (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-fw-orange hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </a>
            ) : null}
          </div>
        </div>
        <Badge variant={variant}>{job.matchScore}% match</Badge>
      </div>
      <p className="mt-2 text-sm text-fw-gray-700">{job.reason}</p>
      <p className="mt-2 inline-flex items-center gap-1 text-xs text-fw-gray-400">
        <Target className="h-3.5 w-3.5" />
        Skill alignment based on selected repository context
      </p>
      {actionsVisible ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onSave!(job.id)}
          >
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onDismiss!(job.id)}
          >
            Dismiss
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

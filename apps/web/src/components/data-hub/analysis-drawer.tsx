"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { RepositorySummary } from "@/stores/forgewind.store";

interface AnalysisDrawerProps {
  open: boolean;
  onClose: () => void;
  repository?: RepositorySummary;
}

export function AnalysisDrawer({ open, onClose, repository }: AnalysisDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg border-l border-border bg-background/95 p-4 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Repository analysis</p>
        <Button size="sm" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Card className="p-4">
        <p className="text-xs text-slate-500">Repository</p>
        <p className="text-sm text-slate-100">{repository?.fullName ?? "No repository selected"}</p>
      </Card>
      <Card className="mt-3 p-4">
        <p className="text-xs text-slate-500">Summary</p>
        <p className="text-sm text-slate-200">
          {repository
            ? `${repository.name} shows strong ${repository.language} fundamentals with a health score of ${repository.healthScore}.`
            : "Select a repository to see contextual analysis."}
        </p>
      </Card>
    </div>
  );
}

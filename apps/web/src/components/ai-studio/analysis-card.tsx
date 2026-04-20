import { BrainCircuit } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AIAnalysisState } from "@/stores/forgewind.store";

interface AnalysisCardProps {
  analysis: AIAnalysisState;
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center gap-2">
        <BrainCircuit className="h-4 w-4 shrink-0 text-fw-orange" aria-hidden />
        <p className="text-sm font-semibold text-foreground">Analysis state</p>
      </div>
      <p className="text-xs text-muted-foreground">Focus: {analysis.focus}</p>
      <p className="mt-1 text-xs text-muted-foreground">Status: {analysis.status}</p>
      <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-foreground">
        {analysis.findings.map((finding) => (
          <li key={finding}>- {finding}</li>
        ))}
      </ul>
    </Card>
  );
}

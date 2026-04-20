import { Brain, Clock3 } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface MemoryInsight {
  id: string;
  title: string;
  detail: string;
  updatedAt: string;
}

interface MemoryInsightCardProps {
  insight: MemoryInsight;
}

export function MemoryInsightCard({ insight }: MemoryInsightCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{insight.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{insight.detail}</p>
        </div>
        <Brain className="h-4 w-4 shrink-0 text-fw-orange" aria-hidden />
      </div>
      <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Clock3 className="h-3.5 w-3.5" />
        {insight.updatedAt}
      </p>
    </Card>
  );
}

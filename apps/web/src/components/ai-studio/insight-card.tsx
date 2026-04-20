import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";

interface InsightCardProps {
  title: string;
  insight: string;
}

export function InsightCard({ title, insight }: InsightCardProps) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 shrink-0 text-fw-orange" aria-hidden />
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <p className="text-sm leading-relaxed text-fw-gray-700">{insight}</p>
    </Card>
  );
}

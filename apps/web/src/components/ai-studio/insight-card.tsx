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
        <Lightbulb className="h-4 w-4 text-amber-300" />
        <p className="text-sm font-semibold text-white">{title}</p>
      </div>
      <p className="text-sm text-slate-300">{insight}</p>
    </Card>
  );
}

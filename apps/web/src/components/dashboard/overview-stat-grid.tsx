import { BarChart3, BriefcaseBusiness, FileText, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OverviewStatGridProps {
  repoCount: number;
  contentCount: number;
}

const statCards = (
  repoCount: number,
  contentCount: number,
): Array<{ label: string; value: string; icon: typeof Sparkles; tone: string }> => [
  {
    label: "AI confidence",
    value: "92%",
    icon: Sparkles,
    tone: "text-primary-600 bg-primary-500/10",
  },
  {
    label: "Tracked repositories",
    value: String(repoCount),
    icon: BarChart3,
    tone: "text-sky-600 bg-sky-500/10",
  },
  {
    label: "Generated assets",
    value: String(contentCount),
    icon: FileText,
    tone: "text-emerald-600 bg-emerald-500/10",
  },
  {
    label: "High-fit jobs",
    value: "14",
    icon: BriefcaseBusiness,
    tone: "text-amber-600 bg-amber-500/10",
  },
];

export function OverviewStatGrid({ repoCount, contentCount }: OverviewStatGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statCards(repoCount, contentCount).map((item) => (
        <Card key={item.label} className="p-4">
          <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${item.tone}`}>
            <item.icon className="h-4 w-4" />
          </div>
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}

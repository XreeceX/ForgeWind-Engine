import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

interface AIResponseBlockProps {
  title: string;
  content: string;
  tone?: "default" | "insight" | "actionable";
}

const toneMap = {
  default: "border-border",
  insight: "border-primary-500/30 bg-primary-500/8",
  actionable: "border-emerald-500/25 bg-emerald-500/8",
} as const;

export function AIResponseBlock({ title, content, tone = "default" }: AIResponseBlockProps) {
  return (
    <Card className={cn("p-4", toneMap[tone])}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{title}</p>
        <Badge variant={tone === "actionable" ? "success" : tone === "insight" ? "primary" : "default"}>{tone}</Badge>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{content}</p>
    </Card>
  );
}

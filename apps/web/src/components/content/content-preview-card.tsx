import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { GeneratedContentItem } from "@/stores/forgewind.store";

interface ContentPreviewCardProps {
  content: GeneratedContentItem;
}

export function ContentPreviewCard({ content }: ContentPreviewCardProps) {
  return (
    <Card className="p-4 transition-all duration-200 hover:border-border-light hover:bg-panel-elevated">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{content.title}</p>
        <Badge variant="info">{content.channel}</Badge>
      </div>
      <p className="line-clamp-3 text-sm text-slate-300">{content.body}</p>
      <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500">
        <CalendarDays className="h-3.5 w-3.5" />
        {new Date(content.createdAt).toLocaleDateString()}
      </div>
    </Card>
  );
}

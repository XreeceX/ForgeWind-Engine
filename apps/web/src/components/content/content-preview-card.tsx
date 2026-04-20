import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { GeneratedContentItem } from "@/stores/forgewind.store";

interface ContentPreviewCardProps {
  content: GeneratedContentItem;
}

export function ContentPreviewCard({ content }: ContentPreviewCardProps) {
  return (
    <Card className="rounded-fw-card border border-fw-gray-100 bg-fw-white p-4 transition-all duration-200 hover:border-fw-orange-mid hover:bg-fw-orange-light/30">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-fw-gray-900">{content.title}</p>
        <Badge variant="info">{content.channel}</Badge>
      </div>
      <p className="line-clamp-3 text-sm text-fw-gray-700">{content.body}</p>
      <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-fw-gray-400">
        <CalendarDays className="h-3.5 w-3.5" />
        {new Date(content.createdAt).toLocaleDateString()}
      </div>
    </Card>
  );
}

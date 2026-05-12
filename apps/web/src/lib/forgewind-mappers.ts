import type { ForgeWindApiNarrative, ForgeWindApiOpportunityMatch } from "@/lib/forgewind-api";
import type { GeneratedContentItem } from "@/stores/forgewind.store";

function narrativeTypeToChannel(
  type: string,
): GeneratedContentItem["channel"] {
  switch (type) {
    case "bio":
      return "linkedin";
    case "project_summary":
      return "portfolio";
    case "commit_story":
      return "linkedin";
    default:
      return "linkedin";
  }
}

export function mapNarrativeToGeneratedItem(n: ForgeWindApiNarrative): GeneratedContentItem {
  const createdAt =
    typeof n.generatedAt === "string"
      ? n.generatedAt
      : new Date(n.generatedAt as unknown as Date).toISOString();
  return {
    id: n.id,
    title: `${n.type.replace(/_/g, " ")} · ${n.modelVersion}`,
    channel: narrativeTypeToChannel(n.type),
    body: n.content,
    createdAt,
  };
}

function humanizeSource(source: string): string {
  return source
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export type JobMatchView = {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  reason: string;
  url: string | null;
  status: string;
};

export function mapOpportunityMatchToJob(m: ForgeWindApiOpportunityMatch): JobMatchView {
  const ms = m.matchedSignals;
  const hint =
    ms && typeof ms === "object" && "summary" in ms && typeof ms.summary === "string"
      ? ms.summary
      : null;
  const score = Math.round(Number(m.matchScore));
  return {
    id: m.id,
    title: m.title,
    company: humanizeSource(m.source),
    location: m.url ? "Apply online" : "—",
    matchScore: Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0,
    reason: hint ?? `Match from ${humanizeSource(m.source)} (${m.status}).`,
    url: m.url,
    status: m.status,
  };
}

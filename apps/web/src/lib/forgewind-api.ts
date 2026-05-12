/**
 * Minimal client for `@forgewind-engine/forgewind-api` (no JWT — uses `X-User-Id`).
 * Use only from client components or server actions after resolving the ForgeWind user UUID.
 */

export function getForgeWindApiBaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_FORGEWIND_API_URL?.trim();
  return url || null;
}

export class ForgeWindApiNotConfiguredError extends Error {
  constructor() {
    super("NEXT_PUBLIC_FORGEWIND_API_URL is not set");
    this.name = "ForgeWindApiNotConfiguredError";
  }
}

export type ForgeWindApiUser = {
  id: string;
  githubId: string;
  username: string;
  avatarUrl: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ForgeWindApiRepository = {
  id: string;
  userId: string;
  githubRepoId: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string;
  isActive: boolean;
  connectedAt: string;
  lastSyncedAt: string | null;
};

export type ForgeWindApiRepoSnapshot = {
  id: string;
  repoId: string;
  capturedAt: string;
  commitCount30d: number;
  focusScore: string;
  healthScore: string;
  topLanguages: Record<string, number>;
  contributors: Array<{ login: string; commits: number }>;
  rawSignal: Record<string, unknown>;
};

export type ForgeWindApiNarrative = {
  id: string;
  userId: string;
  repoId: string | null;
  type: string;
  content: string;
  modelVersion: string;
  generatedAt: string;
  isPinned: boolean;
};

export type ForgeWindApiOpportunityMatch = {
  id: string;
  userId: string;
  title: string;
  source: string;
  matchScore: string;
  matchedSignals: Record<string, unknown>;
  url: string | null;
  status: string;
  surfacedAt: string;
};

export type ForgeWindApiAgentState = {
  id: string;
  userId: string;
  mode: string;
  activeRepoId: string | null;
  agentStatus: string;
  lastAction: string | null;
  updatedAt: string;
};

export async function forgeWindFetch(
  path: string,
  options: RequestInit & { userId?: string | null } = {},
): Promise<Response> {
  const base = getForgeWindApiBaseUrl();
  if (!base) {
    throw new ForgeWindApiNotConfiguredError();
  }

  const { userId, headers: initHeaders, ...rest } = options;
  const url = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(initHeaders);
  if (!headers.has("Content-Type") && rest.body != null) {
    headers.set("Content-Type", "application/json");
  }
  const uid = userId?.trim();
  if (uid) {
    headers.set("X-User-Id", uid);
  }

  return fetch(url, { ...rest, headers });
}

export async function forgeWindJson<T>(
  path: string,
  options: RequestInit & { userId?: string | null } = {},
): Promise<T> {
  const res = await forgeWindFetch(path, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ForgeWind API ${res.status}: ${text.slice(0, 400)}`);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function mapForgeWindRepositoryToSummary(r: ForgeWindApiRepository): {
  id: string;
  name: string;
  fullName: string;
  language: string;
  stars: number;
  healthScore: number;
  summary: string;
} {
  return {
    id: r.id,
    name: r.name,
    fullName: r.fullName,
    language: r.language,
    stars: 0,
    healthScore: r.lastSyncedAt ? 78 : 65,
    summary:
      r.description?.trim() ||
      `Connected repository ${r.fullName}. Sync to refresh signals.`,
  };
}

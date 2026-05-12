"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import {
  ForgeWindApiNotConfiguredError,
  forgeWindJson,
  getForgeWindApiBaseUrl,
  mapForgeWindRepositoryToSummary,
  type ForgeWindApiAgentState,
  type ForgeWindApiRepository,
  type ForgeWindApiUser,
} from "@/lib/forgewind-api";
import { DEMO_USER } from "@/lib/auth/demo-user";
import { useForgeWindStore } from "@/stores/forgewind.store";

const FORGEWIND_DEMO_GITHUB_ID = "forgewind-demo";
const DEMO_AVATAR_URL = "https://avatars.githubusercontent.com/u/9919?s=200&v=4";

/**
 * One-time sync after session is ready: upsert ForgeWind user + load connected repositories.
 * Requires `NEXT_PUBLIC_FORGEWIND_API_URL` (e.g. http://localhost:3001).
 */
export function ForgeWindApiBootstrap() {
  const { status } = useSession();
  const applyForgeWindUserFromApi = useForgeWindStore((s) => s.applyForgeWindUserFromApi);
  const setRepositories = useForgeWindStore((s) => s.setRepositories);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!getForgeWindApiBaseUrl()) return;

    let cancelled = false;

    void (async () => {
      try {
        const user = await forgeWindJson<ForgeWindApiUser>("/users", {
          method: "POST",
          body: JSON.stringify({
            githubId: FORGEWIND_DEMO_GITHUB_ID,
            username: DEMO_USER.name,
            avatarUrl: DEMO_AVATAR_URL,
          }),
        });
        if (cancelled || !user) return;

        applyForgeWindUserFromApi(user);

        const repoRows = await forgeWindJson<ForgeWindApiRepository[]>("/repositories", {
          userId: user.id,
        });
        if (cancelled) return;

        const mapped = repoRows.map(mapForgeWindRepositoryToSummary);
        setRepositories(mapped);

        const active = repoRows.find((r) => r.isActive);
        const nextId = active?.id ?? mapped[0]?.id ?? "";
        useForgeWindStore.setState({ selectedRepositoryId: nextId });

        const agent = await forgeWindJson<ForgeWindApiAgentState>("/agent-state", {
          userId: user.id,
        });
        if (!cancelled && agent) {
          useForgeWindStore.getState().setAgentSnapshot({
            mode: agent.mode,
            agentStatus: agent.agentStatus,
            lastAction: agent.lastAction,
          });
        }
      } catch (e) {
        if (e instanceof ForgeWindApiNotConfiguredError) return;
        console.warn("[ForgeWind API bootstrap]", e);
        toast.error("Could not bootstrap ForgeWind profile from API.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, applyForgeWindUserFromApi, setRepositories]);

  return null;
}

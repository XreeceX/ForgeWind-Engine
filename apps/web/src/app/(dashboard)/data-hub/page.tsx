"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkflowStore } from "@/stores/workflow.store";
import { Github, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface Repo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  metadata: Record<string, unknown>;
}

const INTEGRATION_BASE_URL =
  process.env.NEXT_PUBLIC_INTEGRATION_SERVICE_URL ?? "http://localhost:4010/api/v1";
const CONTENT_BASE_URL =
  process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL ?? "http://localhost:4012/api/v1";
const WORKFLOW_BASE_URL =
  process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL ?? "http://localhost:4013/api/v1";

export default function DataHubPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "1";
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [generated, setGenerated] = useState("");
  const {
    sessionId,
    messages,
    pushMessage,
    setSessionId,
    setSelectedRepoId,
    selectedRepoId,
    clear,
  } = useWorkflowStore();

  const connectUrl = `${INTEGRATION_BASE_URL}/github/auth?userId=${encodeURIComponent(userId)}`;

  const reposQuery = useQuery({
    queryKey: ["github-repos", userId],
    queryFn: async () => {
      const response = await api.get<Repo[]>(
        `${INTEGRATION_BASE_URL}/github/repos?userId=${encodeURIComponent(userId)}`,
      );
      return response.data;
    },
    retry: false,
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const selectedRepos = (reposQuery.data ?? []).filter((repo) =>
        selectedIds.includes(repo.id),
      );
      await api.post(`${INTEGRATION_BASE_URL}/repositories/import`, {
        userId,
        repos: selectedRepos,
      });

      const imported = await api.post(`${INTEGRATION_BASE_URL}/repositories/select`, {
        userId,
        repositoryIds: selectedRepos.map((repo) => String(repo.id)),
      });
      return imported.data as { selected: number };
    },
    onSuccess: (data) => {
      toast.success(`Imported ${data.selected} repositories`);
    },
    onError: () => toast.error("Import failed"),
  });

  const startWorkflowMutation = useMutation({
    mutationFn: async (repoId: string) => {
      const response = await api.post<{ sessionId: string; prompt: string }>(
        `${WORKFLOW_BASE_URL}/workflow/start`,
        { userId, repoId },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      pushMessage({ role: "assistant", text: data.prompt });
    },
  });

  const workflowResponseMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!sessionId) return null;
      const response = await api.post<{ prompt: string; step: string }>(
        `${WORKFLOW_BASE_URL}/workflow/respond`,
        {
          sessionId,
          response: text,
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (!data) return;
      pushMessage({ role: "assistant", text: data.prompt });
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<{ content: string }>(
        `${CONTENT_BASE_URL}/generate/post`,
        {
          userId,
          source: selectedRepoId ?? "repository",
          tone: "professional",
          audience: "hiring managers",
          context: { messages },
        },
      );
      return response.data.content;
    },
    onSuccess: (content) => setGenerated(content),
    onError: () => toast.error("Content generation failed"),
  });

  const selectedCount = useMemo(() => selectedIds.length, [selectedIds.length]);

  return (
    <div>
      <Header title="Data Hub" subtitle="Connect data sources and create personalized AI content" />
      <div className="p-6 space-y-6">
        <Card className="p-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white">GitHub Integration</h2>
            <p className="text-sm text-slate-400 mt-1">
              Connect GitHub, select repositories, and run content workflows.
            </p>
          </div>
          <Button
            variant="secondary"
            icon={<Github className="h-4 w-4" />}
            onClick={() => window.open(connectUrl, "_blank")}
          >
            Connect GitHub
          </Button>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Repository Selection</h3>
            <Button
              size="sm"
              onClick={() => importMutation.mutate()}
              loading={importMutation.isPending}
              disabled={!selectedCount}
            >
              Import {selectedCount ? `(${selectedCount})` : ""}
            </Button>
          </div>
          {reposQuery.isLoading && <p className="text-sm text-slate-400">Loading repositories...</p>}
          {reposQuery.isError && (
            <p className="text-sm text-red-400">
              Unable to fetch repositories. Complete GitHub auth first.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(reposQuery.data ?? []).map((repo) => {
              const checked = selectedIds.includes(repo.id);
              return (
                <label
                  key={repo.id}
                  className="rounded-lg border border-border p-3 flex items-start gap-3 cursor-pointer hover:border-border-light"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      setSelectedIds((prev) =>
                        event.target.checked
                          ? [...prev, repo.id]
                          : prev.filter((id) => id !== repo.id),
                      );
                    }}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{repo.fullName}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{repo.description || "No description"}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {repo.language || "Unknown"} • {repo.stars} stars
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Interactive AI Workflow</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  clear();
                  setGenerated("");
                }}
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => createPostMutation.mutate()}
                loading={createPostMutation.isPending}
                icon={<Sparkles className="h-4 w-4" />}
              >
                Create LinkedIn Post
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(reposQuery.data ?? [])
              .filter((repo) => selectedIds.includes(repo.id))
              .map((repo) => (
                <Button
                  key={repo.id}
                  variant={selectedRepoId === String(repo.id) ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setSelectedRepoId(String(repo.id));
                    startWorkflowMutation.mutate(String(repo.id));
                  }}
                >
                  {repo.name}
                </Button>
              ))}
          </div>

          <div className="rounded-lg border border-border bg-surface-light/20 p-4 min-h-[220px]">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-400">
                Select a repo to start the AI Q&A workflow.
              </p>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="text-sm">
                    <span className="font-semibold text-primary-400">
                      {message.role === "assistant" ? "AI" : "You"}:
                    </span>{" "}
                    <span className="text-slate-200">{message.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {["Project showcase", "Professional", "Hiring managers"].map((preset) => (
              <Button
                key={preset}
                variant="secondary"
                size="sm"
                onClick={() => {
                  pushMessage({ role: "user", text: preset });
                  workflowResponseMutation.mutate(preset);
                }}
                disabled={!sessionId}
              >
                {preset}
              </Button>
            ))}
          </div>

          {generated && (
            <div className="rounded-lg border border-border bg-surface-light/30 p-4">
              <p className="text-sm whitespace-pre-wrap text-slate-200">{generated}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

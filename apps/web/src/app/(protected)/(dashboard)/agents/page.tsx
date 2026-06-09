'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useForgeWindStore } from '@/stores/forgewind.store';
import { useForgeWindAccessToken } from '@/hooks/use-forgewind-access-token';
import {
  forgeWindJson,
  getForgeWindApiBaseUrl,
  type ForgeWindApiNarrative,
} from '@/lib/forgewind-api';
import {
  Bot,
  User,
  Briefcase,
  PenTool,
  TrendingUp,
  Play,
  Plus,
  AlertCircle,
  Activity,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/cn';

type NarrativeContentType =
  | 'bio'
  | 'project_summary'
  | 'commit_story'
  | 'profile_optimization'
  | 'skill_analysis';

type AgentId = 'content-writer' | 'profile-optimizer' | 'skill-analyzer' | 'job-matcher';

interface AgentDefinition {
  id: AgentId;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    id: 'profile-optimizer',
    name: 'Profile Optimizer',
    description:
      'Analyses your GitHub activity and generates a headline + concrete improvements for your professional profile.',
    icon: User,
    color: 'text-primary-400',
    bg: 'bg-primary-500/10',
  },
  {
    id: 'job-matcher',
    name: 'Job Matcher',
    description:
      'Scans your connected repositories and surfaces 3 AI-matched job opportunities tailored to your stack.',
    icon: Briefcase,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    description:
      'Generates LinkedIn-ready bios, project summaries, and commit stories from your repository activity.',
    icon: PenTool,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    id: 'skill-analyzer',
    name: 'Skill Analyzer',
    description:
      'Detects your skill profile from repository data and identifies gaps vs senior market demand.',
    icon: TrendingUp,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
];

type TaskResult =
  | { kind: 'narrative'; data: ForgeWindApiNarrative }
  | { kind: 'matches'; count: number }
  | { kind: 'error'; message: string };

function agentStatusVariant(status: string): 'success' | 'primary' | 'danger' | 'default' {
  if (status === 'active' || status === 'running' || status === 'generating') return 'success';
  if (status === 'error') return 'danger';
  return 'default';
}

function ContentWriterForm({
  repoId,
  setRepoId,
  contentType,
  setContentType,
  repos,
}: {
  repoId: string;
  setRepoId: (v: string) => void;
  contentType: NarrativeContentType;
  setContentType: (v: NarrativeContentType) => void;
  repos: { id: string; fullName: string }[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Content type</label>
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value as NarrativeContentType)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        >
          <option value="bio">Professional bio</option>
          <option value="project_summary">Project summary</option>
          <option value="commit_story">Commit story</option>
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Repository <span className="text-xs text-muted-foreground">(optional)</span>
        </label>
        <select
          value={repoId}
          onChange={(e) => setRepoId(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        >
          <option value="">Profile-level (no repo)</option>
          {repos.map((r) => (
            <option key={r.id} value={r.id}>
              {r.fullName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function RepoPicker({
  repoId,
  setRepoId,
  repos,
  required,
}: {
  repoId: string;
  setRepoId: (v: string) => void;
  repos: { id: string; fullName: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        Repository {required && <span className="text-danger">*</span>}
      </label>
      {repos.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            No repositories connected.{' '}
            <Link href="/overview" className="text-primary-400 hover:underline">
              Connect one first.
            </Link>
          </p>
        </div>
      ) : (
        <select
          value={repoId}
          onChange={(e) => setRepoId(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        >
          <option value="">Select a repository…</option>
          {repos.map((r) => (
            <option key={r.id} value={r.id}>
              {r.fullName}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function TaskResultCard({ result }: { result: TaskResult }) {
  if (result.kind === 'error') {
    return (
      <div className="rounded-lg border border-danger/20 bg-danger/5 p-4">
        <p className="text-sm font-medium text-danger">Error</p>
        <p className="mt-1 text-xs text-muted-foreground">{result.message}</p>
      </div>
    );
  }

  if (result.kind === 'matches') {
    return (
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <p className="text-sm font-medium text-foreground">
            {result.count} new job {result.count === 1 ? 'match' : 'matches'} generated
          </p>
        </div>
        <Link
          href="/jobs"
          className="mt-3 inline-flex items-center gap-1 text-xs text-primary-400 hover:underline"
        >
          View in Jobs <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  if (result.kind === 'narrative') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <p className="text-sm font-medium text-foreground">Generated successfully</p>
        </div>
        <div className="max-h-52 overflow-y-auto rounded-lg border border-border bg-surface p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {result.data.content}
          </p>
        </div>
        <Link
          href="/content"
          className="inline-flex items-center gap-1 text-xs text-primary-400 hover:underline"
        >
          View in Content library <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  return null;
}

export default function AgentsPage() {
  const agentSnapshot = useForgeWindStore((state) => state.agentSnapshot);
  const repositories = useForgeWindStore((state) => state.repositories);
  const forgeWindUserId = useForgeWindStore((state) => state.forgeWindUserId);
  const accessToken = useForgeWindAccessToken();
  const queryClient = useQueryClient();
  const apiReady = !!getForgeWindApiBaseUrl() && !!accessToken;

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | ''>('');
  const [repoId, setRepoId] = useState('');
  const [contentType, setContentType] = useState<NarrativeContentType>('bio');
  const [taskResult, setTaskResult] = useState<TaskResult | null>(null);

  const repos = repositories.map((r) => ({ id: r.id, fullName: r.fullName }));

  const runTask = useMutation({
    mutationFn: async () => {
      if (!selectedAgentId) throw new Error('No agent selected');
      if (!apiReady) throw new Error('ForgeWind API is not configured');
      if (!forgeWindUserId) throw new Error('User not synced with ForgeWind API');

      if (selectedAgentId === 'job-matcher') {
        const rows = await forgeWindJson<Array<{ id: string }>>('/matches/generate', {
          method: 'POST',
          accessToken,
        });
        return { kind: 'matches' as const, count: rows.length };
      }

      const narrativeType: NarrativeContentType =
        selectedAgentId === 'profile-optimizer'
          ? 'profile_optimization'
          : selectedAgentId === 'skill-analyzer'
            ? 'skill_analysis'
            : contentType;

      const body: Record<string, string> = {
        userId: forgeWindUserId,
        type: narrativeType,
      };
      if (repoId) body.repoId = repoId;

      const narrative = await forgeWindJson<ForgeWindApiNarrative>('/narratives/generate', {
        method: 'POST',
        accessToken,
        body: JSON.stringify(body),
      });
      return { kind: 'narrative' as const, data: narrative };
    },
    onSuccess: (result) => {
      setTaskResult(result);
      void queryClient.invalidateQueries({ queryKey: ['forgewind-matches'] });
      void queryClient.invalidateQueries({ queryKey: ['forgewind-narratives'] });
      toast.success(
        result.kind === 'matches'
          ? `${result.count} job ${result.count === 1 ? 'match' : 'matches'} generated`
          : 'Task completed',
      );
    },
    onError: (err: Error) => {
      setTaskResult({ kind: 'error', message: err.message });
    },
  });

  function openModal(agentId: AgentId) {
    setSelectedAgentId(agentId);
    setTaskResult(null);
    setRepoId('');
    setContentType('bio');
    setCreateOpen(true);
  }

  function handleClose() {
    setCreateOpen(false);
    setTaskResult(null);
    runTask.reset();
  }

  const selectedAgent = AGENT_DEFINITIONS.find((a) => a.id === selectedAgentId);

  const canRun = (() => {
    if (!selectedAgentId || !apiReady) return false;
    if (selectedAgentId === 'skill-analyzer') return !!repoId;
    return true;
  })();

  const globalStatus = agentSnapshot?.agentStatus ?? 'idle';
  const globalMode = agentSnapshot?.mode ?? null;
  const lastAction = agentSnapshot?.lastAction ?? null;

  return (
    <div>
      <Header title="AI Agents" subtitle="Your autonomous career assistants" />

      <div className="p-6 space-y-6">
        {/* Live agent state */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10">
                <Activity className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Agent Engine</p>
                <p className="text-xs text-muted-foreground">
                  {globalMode ? `Mode: ${globalMode}` : 'No active mode'}
                  {lastAction ? ` · Last: ${lastAction}` : ''}
                </p>
              </div>
            </div>
            <Badge variant={agentStatusVariant(globalStatus)}>{globalStatus}</Badge>
          </div>
          {!apiReady && (
            <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
              Configure <code className="rounded bg-muted px-1">NEXT_PUBLIC_FORGEWIND_API_URL</code>{' '}
              to enable live agent execution.
            </p>
          )}
        </Card>

        {/* Agent cards */}
        <div>
          <div className="mb-4 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary-400" />
              <h3 className="text-base font-semibold text-foreground">Available Agents</h3>
            </div>
            {apiReady && (
              <Button
                onClick={() => {
                  setSelectedAgentId('');
                  setTaskResult(null);
                  setCreateOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Run Agent
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AGENT_DEFINITIONS.map((agent) => (
              <Card key={agent.id} className="p-5" hover>
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl',
                      agent.bg,
                    )}
                  >
                    <agent.icon className={cn('h-5 w-5', agent.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">{agent.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{agent.description}</p>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={!apiReady}
                        onClick={() => openModal(agent.id)}
                      >
                        <Play className="h-3.5 w-3.5" />
                        Run
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Task History */}
        <Card>
          <div className="flex items-center justify-between px-6 pb-3 pt-5">
            <h3 className="text-base font-semibold text-foreground">Task History</h3>
            <span className="text-xs text-muted-foreground">0 total tasks</span>
          </div>
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <Clock className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No tasks have been run yet. Select an agent above to get started.
            </p>
          </div>
        </Card>
      </div>

      {/* Agent task modal */}
      <Modal
        open={createOpen}
        onClose={handleClose}
        title={selectedAgent ? `Run: ${selectedAgent.name}` : 'Run Agent'}
        size="md"
      >
        <div className="space-y-5">
          {/* Agent selector (shown when opened from "Run Agent" button) */}
          {!selectedAgentId && (
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Select Agent</label>
              <div className="grid grid-cols-2 gap-2">
                {AGENT_DEFINITIONS.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all',
                      'border-border hover:border-border-light',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg',
                        agent.bg,
                      )}
                    >
                      <agent.icon className={cn('h-4 w-4', agent.color)} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{agent.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Agent-specific form */}
          {selectedAgentId === 'content-writer' && (
            <ContentWriterForm
              repoId={repoId}
              setRepoId={setRepoId}
              contentType={contentType}
              setContentType={setContentType}
              repos={repos}
            />
          )}

          {selectedAgentId === 'profile-optimizer' && (
            <RepoPicker repoId={repoId} setRepoId={setRepoId} repos={repos} />
          )}

          {selectedAgentId === 'skill-analyzer' && (
            <RepoPicker repoId={repoId} setRepoId={setRepoId} repos={repos} required />
          )}

          {selectedAgentId === 'job-matcher' && (
            <div className="rounded-lg border border-border bg-surface-light/40 p-4">
              <div className="flex items-start gap-2">
                <Briefcase className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                <p className="text-xs text-muted-foreground">
                  The Job Matcher will analyse all your connected repositories and generate 3
                  tailored opportunity recommendations. Results are saved to your Jobs page.
                </p>
              </div>
            </div>
          )}

          {/* API not configured warning */}
          {!apiReady && selectedAgentId && (
            <div className="flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/5 p-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-warning mt-0.5" />
              <p className="text-xs text-muted-foreground">
                ForgeWind API is not configured. Set{' '}
                <code className="rounded bg-muted px-1">NEXT_PUBLIC_FORGEWIND_API_URL</code> to
                enable live agent execution.
              </p>
            </div>
          )}

          {/* Result card */}
          {taskResult && <TaskResultCard result={taskResult} />}

          {/* Actions */}
          {!taskResult && (
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1"
                disabled={!canRun || runTask.isPending}
                onClick={() => runTask.mutate()}
              >
                {runTask.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running…
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Task
                  </>
                )}
              </Button>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          )}

          {taskResult && (
            <Button variant="secondary" className="w-full" onClick={handleClose}>
              Close
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
}

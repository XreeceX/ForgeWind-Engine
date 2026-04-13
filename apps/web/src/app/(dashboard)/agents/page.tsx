"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Bot,
  User,
  Briefcase,
  PenTool,
  TrendingUp,
  Search,
  Shield,
  Play,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Plus,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "active" | "idle" | "error";
  tasksCompleted: number;
  color: string;
  bg: string;
}

const agents: Agent[] = [
  {
    id: "profile-optimizer",
    name: "Profile Optimizer",
    description:
      "Analyzes and optimizes your LinkedIn profile for maximum visibility and recruiter appeal.",
    icon: User,
    status: "active",
    tasksCompleted: 24,
    color: "text-primary-400",
    bg: "bg-primary-500/10",
  },
  {
    id: "job-matcher",
    name: "Job Matcher",
    description:
      "Scans thousands of job postings to find the best matches based on your skills and preferences.",
    icon: Briefcase,
    status: "active",
    tasksCompleted: 156,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    id: "content-writer",
    name: "Content Writer",
    description:
      "Generates engaging LinkedIn posts, articles, and thought leadership content.",
    icon: PenTool,
    status: "idle",
    tasksCompleted: 38,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    id: "skill-analyzer",
    name: "Skill Analyzer",
    description:
      "Performs gap analysis between your skills and market demand for your target roles.",
    icon: TrendingUp,
    status: "active",
    tasksCompleted: 12,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    id: "network-scout",
    name: "Network Scout",
    description:
      "Identifies valuable connections at target companies and suggests outreach strategies.",
    icon: Search,
    status: "idle",
    tasksCompleted: 67,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    id: "application-assistant",
    name: "Application Assistant",
    description:
      "Tailors resumes and cover letters for specific job applications to maximize response rates.",
    icon: Shield,
    status: "idle",
    tasksCompleted: 31,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
];

type TaskStatus = "pending" | "running" | "completed" | "failed";

interface AgentTask {
  id: string;
  agentId: string;
  agentName: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  result?: string;
}

const mockTasks: AgentTask[] = [
  {
    id: "t1",
    agentId: "profile-optimizer",
    agentName: "Profile Optimizer",
    description: "Optimize headline for senior engineering roles",
    status: "completed",
    createdAt: "2024-04-13T10:30:00Z",
    completedAt: "2024-04-13T10:32:00Z",
    result:
      "Updated headline from 'Software Engineer' to 'Senior Software Engineer | Building AI-Powered Products | Ex-Google'. Expected 40% increase in recruiter views.",
  },
  {
    id: "t2",
    agentId: "job-matcher",
    agentName: "Job Matcher",
    description: "Find senior/staff engineering roles in SF Bay Area",
    status: "completed",
    createdAt: "2024-04-13T09:00:00Z",
    completedAt: "2024-04-13T09:05:00Z",
    result:
      "Found 47 matching positions. Top matches: Stripe (95%), OpenAI (88%), Vercel (82%). 12 new listings since last scan.",
  },
  {
    id: "t3",
    agentId: "skill-analyzer",
    agentName: "Skill Analyzer",
    description: "Run gap analysis against Staff Engineer job requirements",
    status: "running",
    createdAt: "2024-04-13T11:00:00Z",
  },
  {
    id: "t4",
    agentId: "content-writer",
    agentName: "Content Writer",
    description: "Generate thought leadership post about AI engineering trends",
    status: "completed",
    createdAt: "2024-04-12T14:00:00Z",
    completedAt: "2024-04-12T14:03:00Z",
    result:
      "Generated a 280-word LinkedIn post about AI trends in software engineering. Tone: Thought Leader. Estimated engagement: High.",
  },
  {
    id: "t5",
    agentId: "network-scout",
    agentName: "Network Scout",
    description: "Identify engineering managers at Stripe for networking",
    status: "pending",
    createdAt: "2024-04-13T11:15:00Z",
  },
  {
    id: "t6",
    agentId: "application-assistant",
    agentName: "Application Assistant",
    description: "Tailor resume for OpenAI Staff Engineer position",
    status: "failed",
    createdAt: "2024-04-12T16:00:00Z",
    result: "Failed: Job listing URL expired. Please provide an updated link.",
  },
];

const statusConfig: Record<
  TaskStatus,
  { label: string; variant: "default" | "primary" | "success" | "warning" | "danger"; icon: React.ElementType }
> = {
  pending: { label: "Pending", variant: "default", icon: Clock },
  running: { label: "Running", variant: "warning", icon: Loader2 },
  completed: { label: "Completed", variant: "success", icon: CheckCircle2 },
  failed: { label: "Failed", variant: "danger", icon: XCircle },
};

export default function AgentsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [taskInput, setTaskInput] = useState("");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  function handleCreate() {
    setCreateOpen(false);
    setSelectedAgent("");
    setTaskInput("");
  }

  return (
    <div>
      <Header title="AI Agents" subtitle="Your autonomous career assistants" />

      <div className="p-6 space-y-6">
        {/* Agent Cards */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary-400" />
              <h3 className="text-base font-semibold text-white">
                Available Agents
              </h3>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="p-5" hover>
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl",
                      agent.bg
                    )}
                  >
                    <agent.icon className={cn("h-5 w-5", agent.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">
                        {agent.name}
                      </h4>
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          agent.status === "active"
                            ? "bg-emerald-400 animate-pulse"
                            : agent.status === "error"
                              ? "bg-red-400"
                              : "bg-slate-500"
                        )}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {agent.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] text-slate-500">
                        {agent.tasksCompleted} tasks completed
                      </span>
                      <Badge
                        variant={
                          agent.status === "active"
                            ? "success"
                            : agent.status === "error"
                              ? "danger"
                              : "default"
                        }
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Task History */}
        <Card>
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h3 className="text-base font-semibold text-white">
              Task History
            </h3>
            <span className="text-xs text-slate-500">
              {mockTasks.length} total tasks
            </span>
          </div>
          <div className="px-6 pb-5 space-y-2">
            {mockTasks.map((task) => {
              const config = statusConfig[task.status];
              const StatusIcon = config.icon;
              const isExpanded = expandedTask === task.id;
              return (
                <div key={task.id}>
                  <button
                    onClick={() =>
                      setExpandedTask(isExpanded ? null : task.id)
                    }
                    className="flex w-full items-center gap-3 rounded-lg border border-border p-4 text-left transition-all hover:border-border-light hover:bg-surface-light/30"
                  >
                    <StatusIcon
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        task.status === "completed"
                          ? "text-emerald-400"
                          : task.status === "running"
                            ? "text-amber-400 animate-spin"
                            : task.status === "failed"
                              ? "text-red-400"
                              : "text-slate-500"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-primary-400">
                          {task.agentName}
                        </span>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </div>
                      <p className="text-sm text-slate-300 mt-0.5 truncate">
                        {task.description}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 flex-shrink-0 text-slate-500 transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </button>

                  {isExpanded && task.result && (
                    <div className="ml-7 mt-1 rounded-lg border border-border bg-surface-light/20 p-4">
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {task.result}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-2">
                        Started:{" "}
                        {new Date(task.createdAt).toLocaleString()}
                        {task.completedAt &&
                          ` • Completed: ${new Date(task.completedAt).toLocaleString()}`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Create Task Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Task"
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Agent
            </label>
            <div className="grid grid-cols-2 gap-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all",
                    selectedAgent === agent.id
                      ? "border-primary-500/30 bg-primary-500/10"
                      : "border-border hover:border-border-light"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      agent.bg
                    )}
                  >
                    <agent.icon className={cn("h-4 w-4", agent.color)} />
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    {agent.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Task Description
            </label>
            <textarea
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              rows={3}
              placeholder="Describe what you want the agent to do..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 resize-none"
            />
          </div>

          {selectedAgent && (
            <div className="flex items-start gap-2 rounded-lg bg-primary-500/5 border border-primary-500/10 p-3">
              <AlertCircle className="h-4 w-4 text-primary-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                The{" "}
                <span className="text-primary-400 font-medium">
                  {agents.find((a) => a.id === selectedAgent)?.name}
                </span>{" "}
                agent will process this task autonomously. You&apos;ll be
                notified when it completes.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              disabled={!selectedAgent || !taskInput.trim()}
              onClick={handleCreate}
            >
              <Play className="h-4 w-4" />
              Run Task
            </Button>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

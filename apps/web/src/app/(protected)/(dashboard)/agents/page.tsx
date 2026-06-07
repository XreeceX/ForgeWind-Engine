'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  Bot,
  User,
  Briefcase,
  PenTool,
  TrendingUp,
  Search,
  Shield,
  Play,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'active' | 'idle' | 'error';
  tasksCompleted: number;
  color: string;
  bg: string;
}

const agents: Agent[] = [
  {
    id: 'profile-optimizer',
    name: 'Profile Optimizer',
    description:
      'Analyzes and optimizes your LinkedIn profile for maximum visibility and recruiter appeal.',
    icon: User,
    status: 'idle',
    tasksCompleted: 0,
    color: 'text-primary-400',
    bg: 'bg-primary-500/10',
  },
  {
    id: 'job-matcher',
    name: 'Job Matcher',
    description:
      'Scans thousands of job postings to find the best matches based on your skills and preferences.',
    icon: Briefcase,
    status: 'idle',
    tasksCompleted: 0,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    description: 'Generates engaging LinkedIn posts, articles, and thought leadership content.',
    icon: PenTool,
    status: 'idle',
    tasksCompleted: 0,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    id: 'skill-analyzer',
    name: 'Skill Analyzer',
    description:
      'Performs gap analysis between your skills and market demand for your target roles.',
    icon: TrendingUp,
    status: 'idle',
    tasksCompleted: 0,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    id: 'network-scout',
    name: 'Network Scout',
    description:
      'Identifies valuable connections at target companies and suggests outreach strategies.',
    icon: Search,
    status: 'idle',
    tasksCompleted: 0,
    color: 'text-accent-300',
    bg: 'bg-accent-500/10',
  },
  {
    id: 'application-assistant',
    name: 'Application Assistant',
    description:
      'Tailors resumes and cover letters for specific job applications to maximize response rates.',
    icon: Shield,
    status: 'idle',
    tasksCompleted: 0,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
];

export default function AgentsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [taskInput, setTaskInput] = useState('');

  function handleCreate() {
    setCreateOpen(false);
    setSelectedAgent('');
    setTaskInput('');
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
              <h3 className="text-base font-semibold text-foreground">Available Agents</h3>
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
                      'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl',
                      agent.bg,
                    )}
                  >
                    <agent.icon className={cn('h-5 w-5', agent.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">{agent.name}</h4>
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full',
                          agent.status === 'active'
                            ? 'bg-emerald-400 animate-pulse'
                            : agent.status === 'error'
                              ? 'bg-red-400'
                              : 'bg-muted-foreground/60',
                        )}
                      />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {agent.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] text-muted-foreground">
                        {agent.tasksCompleted} tasks completed
                      </span>
                      <Badge
                        variant={
                          agent.status === 'active'
                            ? 'success'
                            : agent.status === 'error'
                              ? 'danger'
                              : 'default'
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
          <div className="flex items-center justify-between px-6 pb-3 pt-5">
            <h3 className="text-base font-semibold text-foreground">Task History</h3>
            <span className="text-xs text-muted-foreground">0 total tasks</span>
          </div>
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <Bot className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No tasks yet. Select an agent and create your first task above.
            </p>
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
            <label className="mb-2 block text-sm font-medium text-foreground">Select Agent</label>
            <div className="grid grid-cols-2 gap-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all',
                    selectedAgent === agent.id
                      ? 'border-primary-500/30 bg-primary-500/10'
                      : 'border-border hover:border-border-light',
                  )}
                >
                  <div
                    className={cn('flex h-8 w-8 items-center justify-center rounded-lg', agent.bg)}
                  >
                    <agent.icon className={cn('h-4 w-4', agent.color)} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{agent.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Task Description
            </label>
            <textarea
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              rows={3}
              placeholder="Describe what you want the agent to do..."
              className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50"
            />
          </div>

          {selectedAgent && (
            <div className="flex items-start gap-2 rounded-lg bg-primary-500/5 border border-primary-500/10 p-3">
              <AlertCircle className="h-4 w-4 text-primary-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                The{' '}
                <span className="text-primary-400 font-medium">
                  {agents.find((a) => a.id === selectedAgent)?.name}
                </span>{' '}
                agent will process this task autonomously. You&apos;ll be notified when it
                completes.
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

"use client";

import { Header } from "@/components/layout/header";
import { ScoreRing } from "@/components/ui/score-ring";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth.store";
import {
  User,
  Briefcase,
  FileText,
  PenTool,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  Bot,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const weeklyData = [
  { day: "Mon", score: 62, applications: 2, content: 1 },
  { day: "Tue", score: 65, applications: 3, content: 0 },
  { day: "Wed", score: 68, applications: 1, content: 2 },
  { day: "Thu", score: 71, applications: 4, content: 1 },
  { day: "Fri", score: 73, applications: 2, content: 3 },
  { day: "Sat", score: 74, applications: 0, content: 1 },
  { day: "Sun", score: 76, applications: 1, content: 0 },
];

const recentActivity = [
  {
    id: "1",
    agent: "Profile Optimizer",
    action: "Updated your LinkedIn headline for better visibility",
    time: "12 min ago",
    status: "completed" as const,
  },
  {
    id: "2",
    agent: "Job Matcher",
    action: "Found 8 new senior engineering roles matching your profile",
    time: "45 min ago",
    status: "completed" as const,
  },
  {
    id: "3",
    agent: "Content Writer",
    action: "Generated a thought leadership post about AI trends",
    time: "2 hours ago",
    status: "completed" as const,
  },
  {
    id: "4",
    agent: "Skill Analyzer",
    action: "Running gap analysis against target roles...",
    time: "Just now",
    status: "running" as const,
  },
  {
    id: "5",
    agent: "Network Scout",
    action: "Identified 15 key connections at target companies",
    time: "3 hours ago",
    status: "completed" as const,
  },
];

const quickActions = [
  {
    label: "Optimize Profile",
    description: "AI-powered LinkedIn optimization",
    icon: User,
    color: "text-primary-400",
    bg: "bg-primary-500/10",
    href: "/profile",
  },
  {
    label: "Find Jobs",
    description: "Discover matching opportunities",
    icon: Target,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    href: "/jobs",
  },
  {
    label: "Generate Content",
    description: "Create engaging LinkedIn posts",
    icon: PenTool,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    href: "/content",
  },
  {
    label: "Analyze Skills",
    description: "Identify gaps and growth areas",
    icon: TrendingUp,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    href: "/skills",
  },
];

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm font-semibold text-white">
          {entry.dataKey === "score" ? "Score" : "Apps"}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
      />

      <div className="p-6 space-y-6">
        {/* Top section: Career Score + Stats */}
        <div className="grid grid-cols-12 gap-6">
          {/* Career Score */}
          <Card className="col-span-12 lg:col-span-4 p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-400" />
                <h2 className="text-lg font-semibold text-white">
                  Career Score
                </h2>
              </div>
              <ScoreRing score={76} size={160} strokeWidth={10} label="/ 100" />
              <p className="text-sm text-slate-400 max-w-xs">
                Your career readiness score based on profile strength, skills,
                and market positioning.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+8 pts this week</span>
              </div>
            </div>
          </Card>

          {/* Stat Cards */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-4">
            <StatCard
              label="Profile Strength"
              value="82%"
              trend={{ value: 5, positive: true }}
              icon={<User className="h-5 w-5" />}
            />
            <StatCard
              label="Job Matches"
              value={47}
              trend={{ value: 12, positive: true }}
              icon={<Briefcase className="h-5 w-5" />}
            />
            <StatCard
              label="Applications"
              value={12}
              trend={{ value: 3, positive: true }}
              icon={<FileText className="h-5 w-5" />}
            />
            <StatCard
              label="Content Score"
              value="91"
              trend={{ value: 8, positive: true }}
              icon={<PenTool className="h-5 w-5" />}
            />
          </div>
        </div>

        {/* Middle section: Activity + Quick Actions */}
        <div className="grid grid-cols-12 gap-6">
          {/* Recent AI Activity */}
          <Card className="col-span-12 lg:col-span-7">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary-400" />
                <h3 className="text-base font-semibold text-white">
                  Recent AI Activity
                </h3>
              </div>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="px-6 pb-5 space-y-1">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-surface-light/50"
                >
                  <div className="mt-0.5">
                    {item.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary-400">
                        {item.agent}
                      </span>
                      <Badge
                        variant={
                          item.status === "completed" ? "success" : "warning"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300 mt-0.5">
                      {item.action}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-slate-500">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Zap className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-semibold text-white">
                Quick Actions
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <a key={action.label} href={action.href}>
                  <Card
                    className="p-4 cursor-pointer group"
                    hover
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.bg} mb-3`}
                    >
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <p className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {action.description}
                    </p>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Weekly Progress Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">
                Weekly Progress
              </h3>
              <p className="text-sm text-slate-400">
                Career score and activity trends
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                <span className="text-xs text-slate-400">Score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-400">Applications</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="appsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#scoreGrad)"
              />
              <Area
                type="monotone"
                dataKey="applications"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#appsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

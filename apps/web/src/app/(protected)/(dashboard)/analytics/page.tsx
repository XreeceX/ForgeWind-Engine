"use client";

import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  FileText,
  MessageSquare,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const scoreTrend = [
  { week: "W1", score: 52 },
  { week: "W2", score: 55 },
  { week: "W3", score: 58 },
  { week: "W4", score: 61 },
  { week: "W5", score: 64 },
  { week: "W6", score: 68 },
  { week: "W7", score: 71 },
  { week: "W8", score: 76 },
];

const funnelData = [
  { stage: "Viewed", count: 47, color: "#ea580c" },
  { stage: "Applied", count: 12, color: "#f97316" },
  { stage: "Screened", count: 8, color: "#fb923c" },
  { stage: "Interview", count: 5, color: "#10b981" },
  { stage: "Offer", count: 2, color: "#34d399" },
];

const heatmapData = [
  { day: "Mon", w1: 3, w2: 5, w3: 2, w4: 4 },
  { day: "Tue", w1: 4, w2: 3, w3: 6, w4: 5 },
  { day: "Wed", w1: 2, w2: 4, w3: 3, w4: 7 },
  { day: "Thu", w1: 5, w2: 6, w3: 4, w4: 3 },
  { day: "Fri", w1: 3, w2: 2, w3: 5, w4: 6 },
  { day: "Sat", w1: 1, w2: 2, w3: 1, w4: 2 },
  { day: "Sun", w1: 0, w2: 1, w3: 2, w4: 1 },
];

const insights = [
  {
    id: "1",
    title: "Profile views increased 45%",
    description:
      "After updating your headline and about section with AI suggestions, your profile views jumped significantly.",
    type: "positive" as const,
    action: "Keep optimizing your content to maintain momentum.",
  },
  {
    id: "2",
    title: "Low response rate on applications",
    description:
      "Only 17% of your applications are getting responses. Consider tailoring each application more specifically.",
    type: "warning" as const,
    action: "Use AI to customize cover letters for each role.",
  },
  {
    id: "3",
    title: "Content engagement is strong",
    description:
      "Your LinkedIn posts are getting 3x more engagement than average. Your thought leadership content resonates.",
    type: "positive" as const,
    action: "Maintain your posting schedule of 3x per week.",
  },
  {
    id: "4",
    title: "Skills gap in AI/ML",
    description:
      "Most jobs in your target companies require AI/ML experience. Consider upskilling to improve match scores.",
    type: "warning" as const,
    action: "Start the LLM Application Development learning path.",
  },
];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm font-semibold text-foreground">
          {entry.value}
        </p>
      ))}
    </div>
  );
}

function getHeatColor(value: number): string {
  if (value === 0) return "bg-surface-lighter";
  if (value <= 2) return "bg-primary-900/60";
  if (value <= 4) return "bg-primary-700/60";
  if (value <= 5) return "bg-primary-500/60";
  return "bg-primary-400/80";
}

export default function AnalyticsPage() {
  return (
    <div>
      <Header title="Analytics" subtitle="Track your career growth metrics" />

      <div className="p-6 space-y-6">
        {/* Top Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Profile Views"
            value="1,247"
            trend={{ value: 45, positive: true }}
            icon={<Eye className="h-5 w-5" />}
          />
          <StatCard
            label="Connections"
            value="892"
            trend={{ value: 12, positive: true }}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Applications"
            value={12}
            trend={{ value: 3, positive: true }}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatCard
            label="Content Engagement"
            value="4.2k"
            trend={{ value: 28, positive: true }}
            icon={<MessageSquare className="h-5 w-5" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-12 gap-6">
          {/* Career Score Trend */}
          <Card className="col-span-12 lg:col-span-7 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-400" />
                <h3 className="text-base font-semibold text-foreground">
                  Career Score Trend
                </h3>
              </div>
              <Badge variant="success">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                +24 pts
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={scoreTrend}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis
                  domain={[40, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Application Funnel */}
          <Card className="col-span-12 lg:col-span-5 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-primary-400" />
              <h3 className="text-base font-semibold text-foreground">
                Application Funnel
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  width={80}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                  {funnelData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Activity Heatmap + Insights */}
        <div className="grid grid-cols-12 gap-6">
          {/* Heatmap */}
          <Card className="col-span-12 lg:col-span-5 p-6">
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Weekly Activity
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-1 ml-12">
                {["W1", "W2", "W3", "W4"].map((w) => (
                  <span
                    key={w}
                    className="text-center text-[10px] text-muted-foreground"
                  >
                    {w}
                  </span>
                ))}
              </div>
              {heatmapData.map((row) => (
                <div key={row.day} className="flex items-center gap-1">
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {row.day}
                  </span>
                  <div className="grid grid-cols-4 gap-1 flex-1 ml-2">
                    {[row.w1, row.w2, row.w3, row.w4].map((val, i) => (
                      <div
                        key={i}
                        className={`h-7 rounded ${getHeatColor(val)} transition-colors`}
                        title={`${val} activities`}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-end gap-1 mt-3">
                <span className="text-[10px] text-muted-foreground">Less</span>
                {[0, 2, 4, 6, 7].map((v) => (
                  <div
                    key={v}
                    className={`h-3 w-3 rounded-sm ${getHeatColor(v)}`}
                  />
                ))}
                <span className="text-[10px] text-muted-foreground">More</span>
              </div>
            </div>
          </Card>

          {/* Insights */}
          <Card className="col-span-12 lg:col-span-7 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lightbulb className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-semibold text-foreground">
                AI Insights
              </h3>
            </div>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="rounded-lg border border-border p-4 transition-colors hover:border-border-light"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground">
                      {insight.title}
                    </h4>
                    <Badge
                      variant={
                        insight.type === "positive" ? "success" : "warning"
                      }
                    >
                      {insight.type === "positive" ? "Positive" : "Attention"}
                    </Badge>
                  </div>
                  <p className="mb-2 text-xs text-muted-foreground">
                    {insight.description}
                  </p>
                  <p className="text-xs text-primary-400 font-medium">
                    {insight.action}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

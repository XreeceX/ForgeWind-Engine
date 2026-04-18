"use client";

import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Target,
  BookOpen,
  Award,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface Skill {
  name: string;
  level: number;
  category: string;
}

const currentSkills: Skill[] = [
  { name: "TypeScript", level: 92, category: "Languages" },
  { name: "React", level: 90, category: "Frontend" },
  { name: "Node.js", level: 85, category: "Backend" },
  { name: "Python", level: 78, category: "Languages" },
  { name: "System Design", level: 82, category: "Architecture" },
  { name: "AWS", level: 75, category: "Cloud" },
  { name: "GraphQL", level: 70, category: "APIs" },
  { name: "PostgreSQL", level: 80, category: "Databases" },
  { name: "Docker", level: 72, category: "DevOps" },
  { name: "Kubernetes", level: 55, category: "DevOps" },
  { name: "Machine Learning", level: 45, category: "AI/ML" },
  { name: "CI/CD", level: 68, category: "DevOps" },
];

const gapAnalysis = [
  {
    skill: "LLM Integration",
    demand: 94,
    yourLevel: 30,
    gap: 64,
    priority: "critical" as const,
  },
  {
    skill: "Kubernetes",
    demand: 85,
    yourLevel: 55,
    gap: 30,
    priority: "high" as const,
  },
  {
    skill: "System Design",
    demand: 92,
    yourLevel: 82,
    gap: 10,
    priority: "medium" as const,
  },
  {
    skill: "Rust",
    demand: 72,
    yourLevel: 10,
    gap: 62,
    priority: "high" as const,
  },
  {
    skill: "Technical Leadership",
    demand: 88,
    yourLevel: 60,
    gap: 28,
    priority: "high" as const,
  },
];

const learningPath = [
  {
    id: "1",
    title: "LLM Application Development",
    duration: "4 weeks",
    status: "in_progress" as const,
    progress: 35,
    modules: 12,
    completedModules: 4,
  },
  {
    id: "2",
    title: "Advanced Kubernetes & Cloud Native",
    duration: "3 weeks",
    status: "upcoming" as const,
    progress: 0,
    modules: 8,
    completedModules: 0,
  },
  {
    id: "3",
    title: "Technical Leadership Fundamentals",
    duration: "2 weeks",
    status: "upcoming" as const,
    progress: 0,
    modules: 6,
    completedModules: 0,
  },
  {
    id: "4",
    title: "Rust for Systems Programming",
    duration: "6 weeks",
    status: "upcoming" as const,
    progress: 0,
    modules: 16,
    completedModules: 0,
  },
];

const certifications = [
  {
    id: "1",
    name: "AWS Solutions Architect",
    issuer: "Amazon Web Services",
    status: "earned" as const,
    date: "2024-06-15",
  },
  {
    id: "2",
    name: "Google Cloud Professional",
    issuer: "Google",
    status: "in_progress" as const,
    progress: 60,
  },
  {
    id: "3",
    name: "Kubernetes Administrator (CKA)",
    issuer: "CNCF",
    status: "recommended" as const,
  },
];

const priorityConfig = {
  critical: { label: "Critical", variant: "danger" as const },
  high: { label: "High", variant: "warning" as const },
  medium: { label: "Medium", variant: "info" as const },
  low: { label: "Low", variant: "default" as const },
};

function getLevelLabel(level: number): string {
  if (level >= 90) return "Expert";
  if (level >= 75) return "Advanced";
  if (level >= 50) return "Intermediate";
  return "Beginner";
}

function getLevelColor(level: number): string {
  if (level >= 90) return "text-emerald-400";
  if (level >= 75) return "text-primary-400";
  if (level >= 50) return "text-amber-400";
  return "text-red-400";
}

export default function SkillsPage() {
  return (
    <div>
      <Header title="Skills" subtitle="Track and develop your skill portfolio" />

      <div className="p-6 space-y-6">
        {/* Current Skills Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Star className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">
              Current Skills
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentSkills.map((skill) => (
              <Card key={skill.name} className="p-4" hover>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {skill.name}
                    </p>
                    <p className="text-xs text-slate-500">{skill.category}</p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      getLevelColor(skill.level)
                    )}
                  >
                    {getLevelLabel(skill.level)}
                  </span>
                </div>
                <Progress
                  value={skill.level}
                  showValue={false}
                  variant={
                    skill.level >= 80
                      ? "accent"
                      : skill.level >= 60
                        ? "primary"
                        : "warning"
                  }
                  size="sm"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] text-slate-500">
                    {skill.level}/100
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Skill Gap Analysis */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Target className="h-5 w-5 text-red-400" />
            <h3 className="text-base font-semibold text-white">
              Skill Gap Analysis
            </h3>
            <span className="text-xs text-slate-500 ml-1">
              Based on your target roles
            </span>
          </div>
          <div className="space-y-4">
            {gapAnalysis.map((item) => (
              <div key={item.skill} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {item.skill}
                    </span>
                    <Badge variant={priorityConfig[item.priority].variant}>
                      {priorityConfig[item.priority].label}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">
                    Gap: {item.gap} pts
                  </span>
                </div>
                <div className="relative">
                  <div className="h-2 w-full rounded-full bg-surface-lighter">
                    <div
                      className="absolute h-2 rounded-full bg-primary-500/40"
                      style={{ width: `${item.yourLevel}%` }}
                    />
                    <div
                      className="absolute h-2 rounded-full border-2 border-dashed border-slate-500"
                      style={{ width: `${item.demand}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-primary-400">
                      You: {item.yourLevel}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Demand: {item.demand}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Learning Path + Certifications */}
        <div className="grid grid-cols-12 gap-6">
          {/* Learning Path */}
          <div className="col-span-12 lg:col-span-7">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary-400" />
                  <h3 className="text-base font-semibold text-white">
                    Learning Path
                  </h3>
                </div>
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="relative space-y-0">
                {learningPath.map((item, i) => (
                  <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < learningPath.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                    )}
                    <div
                      className={cn(
                        "relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                        item.status === "in_progress"
                          ? "bg-primary-500/20 text-primary-400"
                          : "bg-surface-lighter text-slate-500"
                      )}
                    >
                      {item.status === "in_progress" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-white">
                          {item.title}
                        </h4>
                        <Badge
                          variant={
                            item.status === "in_progress"
                              ? "primary"
                              : "default"
                          }
                        >
                          {item.status === "in_progress"
                            ? "In Progress"
                            : "Upcoming"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.duration} &middot; {item.completedModules}/{item.modules}{" "}
                        modules
                      </p>
                      {item.status === "in_progress" && (
                        <Progress
                          value={item.progress}
                          showValue
                          size="sm"
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Certifications */}
          <div className="col-span-12 lg:col-span-5">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Award className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-semibold text-white">
                  Certifications
                </h3>
              </div>
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="rounded-lg border border-border p-4 transition-colors hover:border-border-light"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h4 className="text-sm font-medium text-white">
                          {cert.name}
                        </h4>
                        <p className="text-xs text-slate-500">{cert.issuer}</p>
                      </div>
                      {cert.status === "earned" ? (
                        <Badge variant="success">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Earned
                        </Badge>
                      ) : cert.status === "in_progress" ? (
                        <Badge variant="primary">In Progress</Badge>
                      ) : (
                        <Badge variant="default">Recommended</Badge>
                      )}
                    </div>
                    {cert.status === "earned" && cert.date && (
                      <p className="text-[10px] text-slate-500 mt-1">
                        Earned {cert.date}
                      </p>
                    )}
                    {cert.status === "in_progress" && cert.progress && (
                      <Progress
                        value={cert.progress}
                        showValue
                        size="sm"
                        className="mt-2"
                      />
                    )}
                    {cert.status === "recommended" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 px-0"
                      >
                        Start Preparation{" "}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

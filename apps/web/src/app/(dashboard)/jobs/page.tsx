"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import {
  Search,
  MapPin,
  Building,
  Clock,
  DollarSign,
  Bookmark,
  ExternalLink,
  Filter,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  matchScore: number;
  posted: string;
  remote: boolean;
  tags: string[];
  description: string;
  requirements: string[];
}

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Software Engineer",
    company: "Stripe",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$180k - $250k",
    matchScore: 95,
    posted: "2 days ago",
    remote: true,
    tags: ["TypeScript", "React", "Node.js", "AWS"],
    description:
      "Join Stripe's Platform team to build the next generation of financial infrastructure. You'll work on high-scale distributed systems processing billions of dollars in transactions.",
    requirements: [
      "5+ years of software engineering experience",
      "Strong TypeScript/JavaScript skills",
      "Experience with distributed systems",
      "Excellent communication skills",
    ],
  },
  {
    id: "2",
    title: "Staff Engineer, AI Platform",
    company: "OpenAI",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$250k - $370k",
    matchScore: 88,
    posted: "1 day ago",
    remote: false,
    tags: ["Python", "ML/AI", "Kubernetes", "Go"],
    description:
      "Help build the infrastructure that powers ChatGPT and the OpenAI API. Design and scale systems handling millions of requests per second.",
    requirements: [
      "7+ years in software engineering",
      "Experience with ML infrastructure",
      "Strong systems design skills",
      "Track record of technical leadership",
    ],
  },
  {
    id: "3",
    title: "Engineering Manager, Frontend",
    company: "Vercel",
    location: "Remote",
    type: "Full-time",
    salary: "$200k - $280k",
    matchScore: 82,
    posted: "3 days ago",
    remote: true,
    tags: ["React", "Next.js", "TypeScript", "Leadership"],
    description:
      "Lead a team of frontend engineers building the future of web development tools. Drive technical strategy and mentor engineers on the team.",
    requirements: [
      "3+ years of engineering management",
      "Strong frontend expertise (React, Next.js)",
      "Experience scaling teams",
      "Passion for developer tools",
    ],
  },
  {
    id: "4",
    title: "Full Stack Developer",
    company: "Notion",
    location: "New York, NY",
    type: "Full-time",
    salary: "$160k - $220k",
    matchScore: 79,
    posted: "5 days ago",
    remote: true,
    tags: ["React", "Rust", "PostgreSQL", "TypeScript"],
    description:
      "Build features that millions of people use every day. Work across the stack from our React frontend to our Rust-powered backend.",
    requirements: [
      "4+ years of full stack experience",
      "Proficiency in React and TypeScript",
      "Interest in performance optimization",
      "Collaborative team player",
    ],
  },
  {
    id: "5",
    title: "Senior Backend Engineer",
    company: "Datadog",
    location: "Boston, MA",
    type: "Full-time",
    salary: "$170k - $240k",
    matchScore: 74,
    posted: "1 week ago",
    remote: true,
    tags: ["Go", "Python", "Kafka", "Kubernetes"],
    description:
      "Build high-throughput data pipelines processing trillions of events per day. Design systems that scale with the growing demands of cloud infrastructure monitoring.",
    requirements: [
      "5+ years of backend engineering",
      "Experience with Go or similar languages",
      "Knowledge of distributed systems",
      "Experience with streaming platforms",
    ],
  },
];

const applications = [
  {
    id: "a1",
    job: "Senior SWE at Google",
    status: "interview" as const,
    appliedDate: "2024-01-15",
    stage: "Technical Round 2",
  },
  {
    id: "a2",
    job: "Staff Engineer at Meta",
    status: "applied" as const,
    appliedDate: "2024-01-18",
    stage: "Application Review",
  },
  {
    id: "a3",
    job: "Lead Engineer at Figma",
    status: "offer" as const,
    appliedDate: "2024-01-10",
    stage: "Offer Received",
  },
  {
    id: "a4",
    job: "SWE at Netflix",
    status: "rejected" as const,
    appliedDate: "2024-01-05",
    stage: "After Phone Screen",
  },
];

const statusConfig = {
  applied: { label: "Applied", variant: "info" as const, icon: Send },
  interview: { label: "Interview", variant: "warning" as const, icon: Clock },
  offer: { label: "Offer", variant: "success" as const, icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "danger" as const, icon: XCircle },
};

function MatchScoreBadge({ score }: { score: number }) {
  const variant =
    score >= 90
      ? "success"
      : score >= 75
        ? "primary"
        : score >= 60
          ? "warning"
          : ("default" as const);
  return <Badge variant={variant}>{score}% match</Badge>;
}

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  function toggleSave(id: string) {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filteredJobs = mockJobs.filter(
    (j) =>
      !searchQuery ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <Header title="Jobs" subtitle="Discover AI-matched opportunities" />

      <div className="p-6 space-y-6">
        <Tabs
          tabs={[
            { label: "Job Search", value: "search", count: mockJobs.length },
            { label: "Applications", value: "applications", count: applications.length },
            { label: "Saved", value: "saved", count: savedJobs.size },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "search" && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Search jobs, companies, or skills..."
                icon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                containerClassName="flex-1"
              />
              <div className="flex gap-2">
                <Button variant="secondary" size="md">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button variant="secondary" size="md">
                  <MapPin className="h-4 w-4" />
                  Remote Only
                </Button>
              </div>
            </div>

            {/* Job List */}
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className={cn(
                    "p-5 cursor-pointer transition-all",
                    selectedJob?.id === job.id && "border-primary-500/30 bg-primary-500/5"
                  )}
                  hover
                >
                  <div onClick={() => setSelectedJob(job)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface-lighter text-lg font-bold text-slate-300">
                          {job.company[0]}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Building className="h-3.5 w-3.5" />
                              {job.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              {job.salary}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <MatchScoreBadge score={job.matchScore} />
                            <Badge variant={job.remote ? "success" : "default"}>
                              {job.remote ? "Remote" : "On-site"}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              <Clock className="inline h-3 w-3 mr-0.5" />
                              {job.posted}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(job.id);
                          }}
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
                            savedJobs.has(job.id)
                              ? "border-primary-500/30 bg-primary-500/10 text-primary-400"
                              : "border-border text-slate-500 hover:text-white"
                          )}
                        >
                          <Bookmark
                            className="h-4 w-4"
                            fill={savedJobs.has(job.id) ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3 ml-16">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-surface-lighter px-2 py-0.5 text-xs text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "applications" && (
          <div className="space-y-3">
            {applications.map((app) => {
              const config = statusConfig[app.status];
              const StatusIcon = config.icon;
              return (
                <Card key={app.id} className="p-5" hover>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          app.status === "offer"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : app.status === "interview"
                              ? "bg-amber-500/10 text-amber-400"
                              : app.status === "rejected"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-sky-500/10 text-sky-400"
                        )}
                      >
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {app.job}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {app.stage} &middot; Applied {app.appliedDate}
                        </p>
                      </div>
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-3">
            {savedJobs.size === 0 ? (
              <Card className="p-12 text-center">
                <Bookmark className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No saved jobs yet
                </h3>
                <p className="text-sm text-slate-400">
                  Bookmark jobs from the search tab to save them here.
                </p>
              </Card>
            ) : (
              mockJobs
                .filter((j) => savedJobs.has(j.id))
                .map((job) => (
                  <Card key={job.id} className="p-5" hover>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {job.company} &middot; {job.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <MatchScoreBadge score={job.matchScore} />
                        <Button size="sm">Apply</Button>
                      </div>
                    </div>
                  </Card>
                ))
            )}
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      <Modal
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title}
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-lighter text-xl font-bold text-slate-300">
                {selectedJob.company[0]}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedJob.company}
                </h3>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span>{selectedJob.location}</span>
                  <span>{selectedJob.type}</span>
                  <span>{selectedJob.salary}</span>
                </div>
              </div>
              <div className="ml-auto">
                <MatchScoreBadge score={selectedJob.matchScore} />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-2">
                Description
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedJob.description}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-2">
                Requirements
              </h4>
              <ul className="space-y-1.5">
                {selectedJob.requirements.map((req, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedJob.tags.map((tag) => (
                <Badge key={tag} variant="primary">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1">
                <Send className="h-4 w-4" />
                Apply Now
              </Button>
              <Button variant="secondary">
                <ExternalLink className="h-4 w-4" />
                View Original
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

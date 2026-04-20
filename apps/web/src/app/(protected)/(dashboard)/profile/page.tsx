"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Linkedin,
  MapPin,
  Building,
  ExternalLink,
} from "lucide-react";

const suggestions = [
  {
    id: "1",
    section: "Headline",
    current: "Software Engineer",
    suggested:
      "Senior Software Engineer | Building AI-Powered Products | Ex-Google | Open Source Contributor",
    impact: "high" as const,
  },
  {
    id: "2",
    section: "About",
    current: "I am a software engineer with 5 years of experience.",
    suggested:
      "Passionate technologist with 5+ years crafting scalable systems at the intersection of AI and product engineering. Led teams shipping features used by 10M+ users at Google. Now focused on democratizing career tools with AI.",
    impact: "high" as const,
  },
  {
    id: "3",
    section: "Skills",
    current: "Missing key skills",
    suggested: "Add: System Design, LLM Integration, Technical Leadership",
    impact: "medium" as const,
  },
  {
    id: "4",
    section: "Experience",
    current: "Weak bullet points",
    suggested:
      "Add quantified achievements: 'Reduced API latency by 40%' instead of 'Worked on APIs'",
    impact: "medium" as const,
  },
];

const profileSections = [
  {
    id: "headline",
    label: "Headline",
    value:
      "Senior Software Engineer | AI Enthusiast | Building the Future of Work",
  },
  {
    id: "about",
    label: "About",
    value:
      "Passionate software engineer with 5+ years of experience building scalable web applications. Skilled in React, Node.js, TypeScript, and Python. Currently exploring AI/ML applications in career technology. Previously at Google and two early-stage startups.",
  },
  {
    id: "experience",
    label: "Current Role",
    value:
      "Senior Software Engineer at TechCorp — Leading a team of 5 engineers building AI-powered analytics platform. Shipped v2.0 reducing processing time by 60%. Stack: TypeScript, React, Python, AWS.",
  },
];

const skills = [
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "AWS",
  "System Design",
  "GraphQL",
  "PostgreSQL",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Machine Learning",
];

export default function ProfilePage() {
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [userSkills, setUserSkills] = useState(skills);
  const [newSkill, setNewSkill] = useState("");

  function applySuggestion(id: string) {
    setAppliedSuggestions((prev) => new Set(prev).add(id));
  }

  function addSkill() {
    if (newSkill.trim() && !userSkills.includes(newSkill.trim())) {
      setUserSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  }

  function removeSkill(skill: string) {
    setUserSkills((prev) => prev.filter((s) => s !== skill));
  }

  return (
    <div>
      <Header title="Profile" subtitle="Optimize your LinkedIn profile with AI" />

      <div className="p-6 space-y-6">
        {/* Profile Preview + Completeness */}
        <div className="grid grid-cols-12 gap-6">
          <Card className="col-span-12 lg:col-span-5 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 text-xl font-bold">
                AC
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground">Alex Chen</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Senior Software Engineer | AI Enthusiast
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> San Francisco, CA
                  </span>
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" /> TechCorp
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="success">Open to Work</Badge>
                  <Badge variant="primary">
                    <Linkedin className="h-3 w-3 mr-1" /> Connected
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-border">
              <Progress
                value={82}
                label="Profile Completeness"
                variant="accent"
                size="md"
              />
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> 8/10
                  sections completed
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-amber-600" /> 2
                  improvements needed
                </span>
              </div>
            </div>

            <Button className="w-full mt-4" variant="secondary" size="sm">
              <ExternalLink className="h-3.5 w-3.5" />
              View on LinkedIn
            </Button>
          </Card>

          {/* AI Suggestions */}
          <Card className="col-span-12 lg:col-span-7">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-400" />
                <h3 className="text-base font-semibold text-foreground">
                  AI Suggestions
                </h3>
              </div>
              <Badge variant="primary">
                {suggestions.length - appliedSuggestions.size} remaining
              </Badge>
            </div>
            <div className="px-6 pb-5 space-y-3">
              {suggestions.map((s) => {
                const applied = appliedSuggestions.has(s.id);
                return (
                  <div
                    key={s.id}
                    className={`rounded-lg border p-4 transition-all ${
                      applied
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-border bg-surface-light/30 hover:border-border-light"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {s.section}
                        </span>
                        <Badge
                          variant={
                            s.impact === "high" ? "danger" : "warning"
                          }
                        >
                          {s.impact} impact
                        </Badge>
                      </div>
                      {applied ? (
                        <Badge variant="success">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Applied
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => applySuggestion(s.id)}
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-through mb-1">
                      {s.current}
                    </p>
                    <p className="text-sm text-fw-gray-700">{s.suggested}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Section Editors */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground px-1">
            Profile Sections
          </h3>
          {profileSections.map((section) => (
            <Card key={section.id} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground">
                  {section.label}
                </h4>
                <Button variant="secondary" size="sm">
                  <Sparkles className="h-3.5 w-3.5 text-primary-400" />
                  AI Optimize
                </Button>
              </div>
              <textarea
                defaultValue={section.value}
                rows={section.id === "about" ? 4 : 2}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/25 resize-none"
              />
            </Card>
          ))}
        </div>

        {/* Skills Section */}
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-foreground mb-4">Skills</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {userSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-light px-3 py-1.5 text-sm text-fw-gray-700"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-muted-foreground hover:text-danger transition-colors duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              className="max-w-xs"
            />
            <Button variant="secondary" size="sm" onClick={addSkill}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

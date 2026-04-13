"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Calendar,
  FileText,
  MessageSquare,
  Mail,
  User,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/cn";

const contentTypes = [
  { label: "LinkedIn Post", value: "post", icon: MessageSquare },
  { label: "Headline", value: "headline", icon: User },
  { label: "About Section", value: "about", icon: FileText },
  { label: "Cold Email", value: "email", icon: Mail },
];

const toneOptions = [
  "Professional",
  "Thought Leader",
  "Conversational",
  "Inspiring",
  "Technical",
  "Storytelling",
];

const templates = [
  {
    id: "1",
    title: "Career Milestone",
    description: "Share a professional achievement or promotion",
    type: "post",
    content:
      "I'm thrilled to share that [milestone]. This journey taught me [lesson]. Key takeaways:\n\n1. [Takeaway 1]\n2. [Takeaway 2]\n3. [Takeaway 3]\n\nGrateful for [thanks]. What's been your biggest career milestone?",
  },
  {
    id: "2",
    title: "Industry Insight",
    description: "Share your perspective on a trending topic",
    type: "post",
    content:
      "The future of [industry] is being shaped by [trend]. Here's why this matters:\n\n[Insight]\n\nThree things I'm watching closely:\n• [Point 1]\n• [Point 2]\n• [Point 3]\n\nWhat are your thoughts?",
  },
  {
    id: "3",
    title: "Lesson Learned",
    description: "Share a valuable lesson from your experience",
    type: "post",
    content:
      "The best career advice I ever received: [advice]\n\nHere's how it changed my approach:\n\nBefore: [old approach]\nAfter: [new approach]\nResult: [outcome]\n\nWhat advice changed your career trajectory?",
  },
  {
    id: "4",
    title: "Tech Deep Dive",
    description: "Share technical knowledge or a tutorial",
    type: "post",
    content:
      "I just spent a week exploring [technology] and here's what I learned:\n\n🔹 [Finding 1]\n🔹 [Finding 2]\n🔹 [Finding 3]\n\nThe biggest surprise? [surprise]\n\nThread 🧵",
  },
];

const calendarPosts = [
  {
    id: "1",
    title: "AI in Software Engineering",
    date: "Mon, Apr 14",
    time: "9:00 AM",
    status: "scheduled" as const,
  },
  {
    id: "2",
    title: "Career Growth Tips",
    date: "Wed, Apr 16",
    time: "12:00 PM",
    status: "draft" as const,
  },
  {
    id: "3",
    title: "Open Source Contribution Story",
    date: "Fri, Apr 18",
    time: "8:30 AM",
    status: "scheduled" as const,
  },
  {
    id: "4",
    title: "Weekend Reading List",
    date: "Sat, Apr 19",
    time: "10:00 AM",
    status: "idea" as const,
  },
];

const sampleGenerated = `I've been thinking about how AI is fundamentally reshaping the software engineering landscape, and here's what I'm seeing:

The engineers who will thrive in 2026 aren't the ones who fear AI — they're the ones who learn to collaborate with it.

Here's my framework for staying ahead:

1. 𝗔𝘂𝗴𝗺𝗲𝗻𝘁, 𝗱𝗼𝗻'𝘁 𝗿𝗲𝗽𝗹𝗮𝗰𝗲 — Use AI to amplify your strengths, not replace your thinking. The best code still needs human judgment for architecture and trade-offs.

2. 𝗙𝗼𝗰𝘂𝘀 𝗼𝗻 𝘁𝗵𝗲 "𝘄𝗵𝘆" — AI can generate code, but understanding WHY a solution is right requires deep domain knowledge. Double down on understanding business problems.

3. 𝗕𝘂𝗶𝗹𝗱 𝘆𝗼𝘂𝗿 𝗔𝗜 𝘁𝗼𝗼𝗹𝗸𝗶𝘁 — Experiment with different AI tools. Find what works for your workflow. The productivity gains are real.

The future belongs to engineers who can bridge human creativity with AI capability.

What's your experience using AI in your development workflow? I'd love to hear different perspectives.

#SoftwareEngineering #AI #CareerGrowth #TechLeadership`;

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("generate");
  const [contentType, setContentType] = useState("post");
  const [topic, setTopic] = useState("AI in software engineering - how to stay ahead");
  const [tone, setTone] = useState("Thought Leader");
  const [generated, setGenerated] = useState(sampleGenerated);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    setIsGenerating(true);
    setTimeout(() => {
      setGenerated(sampleGenerated);
      setIsGenerating(false);
    }, 1500);
  }

  function handleCopy() {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <Header title="Content" subtitle="Create engaging LinkedIn content with AI" />

      <div className="p-6 space-y-6">
        <Tabs
          tabs={[
            { label: "Generate", value: "generate" },
            { label: "Calendar", value: "calendar", count: calendarPosts.length },
            { label: "Templates", value: "templates", count: templates.length },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "generate" && (
          <div className="grid grid-cols-12 gap-6">
            {/* Form */}
            <div className="col-span-12 lg:col-span-5 space-y-5">
              <Card className="p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Content Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {contentTypes.map((ct) => (
                      <button
                        key={ct.value}
                        onClick={() => setContentType(ct.value)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all",
                          contentType === ct.value
                            ? "border-primary-500/30 bg-primary-500/10 text-primary-400"
                            : "border-border text-slate-400 hover:border-border-light hover:text-slate-200"
                        )}
                      >
                        <ct.icon className="h-4 w-4" />
                        {ct.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Topic / Prompt
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 resize-none"
                    placeholder="What would you like to write about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tone
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {toneOptions.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                          tone === t
                            ? "border-primary-500/30 bg-primary-500/10 text-primary-400"
                            : "border-border text-slate-400 hover:border-border-light hover:text-slate-200"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  loading={isGenerating}
                >
                  <Wand2 className="h-4 w-4" />
                  {isGenerating ? "Generating..." : "Generate Content"}
                </Button>
              </Card>
            </div>

            {/* Preview */}
            <div className="col-span-12 lg:col-span-7">
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Generated Content
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerate}
                      loading={isGenerating}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Regenerate
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleCopy}>
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>

                {generated ? (
                  <div className="rounded-lg border border-border bg-surface-light/30 p-4">
                    <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">
                      {generated}
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Sparkles className="h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-sm text-slate-400">
                      Configure your content and click Generate
                    </p>
                  </div>
                )}

                {generated && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{generated.length} characters</span>
                      <span>
                        {generated.split(/\s+/).length} words
                      </span>
                    </div>
                    <Button size="sm">
                      <Calendar className="h-3.5 w-3.5" />
                      Schedule Post
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="space-y-3">
            {calendarPosts.map((post) => (
              <Card key={post.id} className="p-5" hover>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center rounded-lg bg-surface-lighter px-3 py-2 text-center min-w-[72px]">
                      <span className="text-xs text-slate-500">
                        {post.date.split(", ")[0]}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {post.date.split(", ")[1]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {post.time}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      post.status === "scheduled"
                        ? "success"
                        : post.status === "draft"
                          ? "warning"
                          : "default"
                    }
                  >
                    {post.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "templates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((t) => (
              <Card key={t.id} className="p-5" hover>
                <h3 className="text-sm font-semibold text-white mb-1">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-400 mb-3">{t.description}</p>
                <div className="rounded-lg bg-surface-light/30 border border-border p-3 mb-3">
                  <p className="text-xs text-slate-400 line-clamp-4 whitespace-pre-line">
                    {t.content}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setTopic(t.content);
                    setActiveTab("generate");
                  }}
                >
                  Use Template
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

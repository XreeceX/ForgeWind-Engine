"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Zap,
  FileText,
  Lightbulb,
  GitBranch,
  Target,
  ArrowRight,
  Send,
  Sparkles,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/cn";

type ChatMode = "chat" | "build";
type MessageType = "insight" | "action" | "artifact" | "suggestion";
type Role = "user" | "assistant";

interface MessageAction {
  id: string;
  label: string;
}

interface ChatMessage {
  id: string;
  role: Role;
  type: MessageType;
  title: string;
  content: string;
  actions?: MessageAction[];
}

const actionLabels: Record<string, string> = {
  create_post: "Create LinkedIn Post",
  write_article: "Write Article",
  deep_analyze_repo: "Deep Analyze Repo",
  improve_portfolio: "Improve Portfolio",
  generate_job_apps: "Generate Job Applications",
  change_tone: "Change Tone",
  technical_rewrite: "Make More Technical",
  storytelling_rewrite: "Make More Storytelling",
  optimize_recruiters: "Optimize For Recruiters",
  shorten_artifact: "Shorten",
  add_technical_depth: "Add Technical Depth",
  improve_clarity: "Improve Clarity",
};

const initialArtifact = `I spent this week improving a backend repo for scale and reliability.

What changed:
- Added cleaner service boundaries
- Improved observability and deployment flow
- Reduced operational friction for future features

If you are building APIs right now, the biggest unlock is not just writing endpoints.
It is designing systems that stay maintainable as complexity increases.

#Backend #SoftwareEngineering #CareerGrowth`;

const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    type: "insight",
    title: "Insight Message",
    content:
      "This workspace is strongest when chat and execution stay synchronized: strategy first, then one-click actions that produce editable artifacts.",
  },
  {
    id: "m2",
    role: "assistant",
    type: "action",
    title: "Action Message",
    content: "Pick an action to execute now.",
    actions: [
      { id: "create_post", label: actionLabels.create_post },
      { id: "deep_analyze_repo", label: actionLabels.deep_analyze_repo },
      { id: "generate_job_apps", label: actionLabels.generate_job_apps },
    ],
  },
  {
    id: "m3",
    role: "assistant",
    type: "artifact",
    title: "Artifact Message",
    content:
      "Generated content opens in an editable canvas with inline AI suggestions and a command bar.",
  },
];

const quickActions = [
  "create_post",
  "write_article",
  "deep_analyze_repo",
  "improve_portfolio",
  "generate_job_apps",
];

function applyCommand(text: string, command: string) {
  const normalized = command.trim().toLowerCase();
  if (!normalized) return text;
  if (normalized.includes("more technical") || normalized.includes("technical")) {
    return `${text}\n\nTechnical additions:\n- Mention throughput + latency improvements\n- Include architecture trade-offs\n- Quantify reliability outcomes`;
  }
  if (normalized.includes("tweet")) {
    return `Thread idea:\n1/ Built a backend system to be easier to scale and operate.\n2/ Biggest win: clear service boundaries + better observability.\n3/ Result: faster iteration and fewer deployment surprises.\n4/ Engineers who think in systems build longer-lasting products.\n\n#buildinpublic #backend`;
  }
  if (normalized.includes("recruiter")) {
    return `${text}\n\nRecruiter lens:\n- Role target: Backend Engineer\n- Key strengths: scalability, reliability, delivery ownership\n- Suggested CTA: open to backend roles in product-focused teams`;
  }
  if (normalized.includes("shorten")) {
    return text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .slice(0, 7)
      .join("\n");
  }
  if (normalized.includes("story")) {
    return `A year ago, I was mostly focused on shipping features quickly.\n\nThis month, I rebuilt a backend flow with one goal: make it scale without becoming fragile.\n\nThat shift changed how I think about engineering growth.\n\nGreat backend work is not just code. It is architecture, observability, and reliability under pressure.\n\n#Backend #EngineeringLeadership`;
  }
  return `${text}\n\nRefinement: ${command}`;
}

function messageTypeIcon(type: MessageType) {
  switch (type) {
    case "insight":
      return Brain;
    case "action":
      return Zap;
    case "artifact":
      return FileText;
    case "suggestion":
      return Lightbulb;
  }
}

function messageTypeTone(type: MessageType) {
  switch (type) {
    case "insight":
      return "text-primary-400 border-primary-500/20 bg-primary-500/5";
    case "action":
      return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    case "artifact":
      return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    case "suggestion":
      return "text-purple-400 border-purple-500/20 bg-purple-500/5";
  }
}

export default function ContentPage() {
  const [mode, setMode] = useState<ChatMode>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [userInput, setUserInput] = useState("");
  const [artifactText, setArtifactText] = useState(initialArtifact);
  const [commandInput, setCommandInput] = useState("");
  const [activeTask, setActiveTask] = useState("Create viral LinkedIn post from repo");

  const messageCount = useMemo(() => messages.length, [messages]);

  function pushAssistantInsight(userPrompt: string) {
    const prompt = userPrompt.toLowerCase();
    const content = prompt.includes("job")
      ? "To get backend interviews faster, focus on proof: project impact, stack credibility, and tailored applications by role band."
      : prompt.includes("repo")
        ? "Your repo story should frame architecture decisions, scale constraints, and measurable outcomes so recruiters see senior-level thinking."
        : "Use a focused angle, one audience, and one clear CTA to maximize engagement and keep content actionable.";

    const nextInsight: ChatMessage = {
      id: `m-${Date.now()}-insight`,
      role: "assistant",
      type: "insight",
      title: "Insight Message",
      content,
    };

    const nextAction: ChatMessage = {
      id: `m-${Date.now()}-action`,
      role: "assistant",
      type: "action",
      title: "Action Message",
      content: "Execute one next step now:",
      actions: [
        { id: "create_post", label: actionLabels.create_post },
        { id: "technical_rewrite", label: actionLabels.technical_rewrite },
        { id: "optimize_recruiters", label: actionLabels.optimize_recruiters },
      ],
    };

    setMessages((prev) => [...prev, nextInsight, nextAction]);
  }

  function runAction(actionId: string) {
    let nextArtifact = artifactText;
    if (actionId === "create_post") {
      nextArtifact = `Most engineers talk about features shipped.\n\nThe teams that scale talk about systems sustained.\n\nThis week I took a backend repo and improved three things:\n1) Service boundaries for cleaner ownership\n2) Observability for faster debugging\n3) Deployment reliability for safer releases\n\nShipping fast matters. Sustaining velocity matters more.\n\n#BackendEngineering #SystemDesign #CareerGrowth`;
      setActiveTask("Generate LinkedIn post");
    } else if (actionId === "write_article") {
      nextArtifact = `# Turning a backend repo into career leverage\n\n## Why this project matters\nA strong backend project demonstrates architecture judgment, not just coding speed.\n\n## What to highlight\n- Throughput and latency decisions\n- Reliability and monitoring trade-offs\n- Deployment and ownership model\n\n## Recruiter-ready takeaway\nShow measurable outcomes and role relevance for backend positions.`;
      setActiveTask("Write article draft");
    } else if (actionId === "deep_analyze_repo") {
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}-insight`,
          role: "assistant",
          type: "insight",
          title: "Insight Message",
          content:
            "Repo analysis focus: architecture map, reliability gaps, deployment risks, and portfolio framing for backend hiring managers.",
        },
      ]);
      setActiveTask("Deep repo analysis");
      return;
    } else if (actionId === "improve_portfolio") {
      nextArtifact = `${artifactText}\n\nPortfolio upgrade checklist:\n- Add architecture diagram\n- Add metrics before/after improvements\n- Add role-specific impact bullets`;
      setActiveTask("Improve portfolio assets");
    } else if (actionId === "generate_job_apps") {
      nextArtifact = `Job application pack (backend focus)\n\n- Resume bullet set tailored to API and distributed systems roles\n- Cover letter angle around system reliability ownership\n- Recruiter outreach script with concise technical proof`;
      setActiveTask("Generate job applications");
    } else if (actionId === "technical_rewrite") {
      nextArtifact = applyCommand(artifactText, "make this more technical");
    } else if (actionId === "storytelling_rewrite") {
      nextArtifact = applyCommand(artifactText, "add storytelling");
    } else if (actionId === "optimize_recruiters") {
      nextArtifact = applyCommand(artifactText, "optimize for recruiters");
    } else if (actionId === "shorten_artifact") {
      nextArtifact = applyCommand(artifactText, "shorten");
    } else if (actionId === "add_technical_depth") {
      nextArtifact = applyCommand(artifactText, "technical depth");
    } else if (actionId === "improve_clarity") {
      nextArtifact = `${artifactText}\n\nClarity pass: tighten the hook, shorten long sentences, and keep each paragraph to one idea.`;
    } else if (actionId === "change_tone") {
      nextArtifact = `${artifactText}\n\nTone shift: confident, direct, and concise with one practical takeaway.`;
    }

    setArtifactText(nextArtifact);
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}-artifact`,
        role: "assistant",
        type: "artifact",
        title: "Artifact Message",
        content: `Executed: ${actionLabels[actionId] ?? actionId}. Output is ready in the editable canvas.`,
      },
      {
        id: `m-${Date.now()}-suggestion`,
        role: "assistant",
        type: "suggestion",
        title: "Suggestion Message",
        content: "Next: test a new tone, shorten for mobile readers, or optimize for recruiters.",
      },
    ]);
  }

  function sendMessage() {
    if (!userInput.trim()) return;
    const prompt = userInput.trim();
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}-user`,
        role: "user",
        type: "insight",
        title: "User Message",
        content: prompt,
      },
    ]);
    setUserInput("");
    pushAssistantInsight(prompt);
  }

  function runCommandBar() {
    if (!commandInput.trim()) return;
    setArtifactText((prev) => applyCommand(prev, commandInput));
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}-command`,
        role: "assistant",
        type: "action",
        title: "Action Message",
        content: `Command executed: "${commandInput}"`,
      },
    ]);
    setCommandInput("");
  }

  return (
    <div>
      <Header
        title="CareerOS AI Chat"
        subtitle="Dual-channel experience: strategy + execution"
      />

      <div className="p-6 space-y-6">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Badge variant="default">Mode Switch</Badge>
            <Button
              size="sm"
              variant={mode === "chat" ? "primary" : "secondary"}
              onClick={() => setMode("chat")}
            >
              Chat Mode
            </Button>
            <Button
              size="sm"
              variant={mode === "build" ? "primary" : "secondary"}
              onClick={() => setMode("build")}
            >
              Build Mode
            </Button>
            <span className="text-xs text-slate-500 ml-2">
              {messageCount} messages in thread
            </span>
          </div>
        </Card>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-8 space-y-5">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">
                  AI Chat (Thinking Layer)
                </h2>
                <Badge variant={mode === "build" ? "warning" : "primary"}>
                  {mode === "build" ? "Execution-ready" : "Strategy-first"}
                </Badge>
              </div>

              <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
                {messages.map((message) => {
                  const Icon = messageTypeIcon(message.type);
                  const isUser = message.role === "user";
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "rounded-xl border p-4",
                        isUser
                          ? "border-border-light bg-surface-light/40"
                          : messageTypeTone(message.type)
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4" />
                        <p className="text-xs font-semibold">{message.title}</p>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {message.content}
                      </p>

                      {message.actions && message.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.actions.map((action) => (
                            <Button
                              key={action.id}
                              size="sm"
                              variant="secondary"
                              onClick={() => runAction(action.id)}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <label className="text-xs text-slate-400">
                  Ask AI (chat input)
                </label>
                <div className="mt-2 flex items-end gap-2">
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="What should I post today? Analyze this repo. Help me get a backend job..."
                    rows={2}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 resize-none"
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-white">
                    Generated LinkedIn Post (Editable Canvas)
                  </h2>
                </div>
                <Badge variant="success">Artifact Message</Badge>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-8">
                  <textarea
                    value={artifactText}
                    onChange={(e) => setArtifactText(e.target.value)}
                    rows={14}
                    className="w-full rounded-lg border border-border bg-surface-light/30 px-3 py-3 text-sm text-slate-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50"
                  />
                </div>
                <div className="col-span-12 lg:col-span-4">
                  <div className="rounded-lg border border-border bg-surface-light/30 p-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-300">
                      AI Suggestions Sidebar
                    </p>
                    <Button
                      className="w-full"
                      variant="secondary"
                      size="sm"
                      onClick={() => runAction("improve_clarity")}
                    >
                      Improve clarity
                    </Button>
                    <Button
                      className="w-full"
                      variant="secondary"
                      size="sm"
                      onClick={() => runAction("shorten_artifact")}
                    >
                      Shorten
                    </Button>
                    <Button
                      className="w-full"
                      variant="secondary"
                      size="sm"
                      onClick={() => runAction("add_technical_depth")}
                    >
                      Add technical depth
                    </Button>
                    <Button
                      className="w-full"
                      variant="secondary"
                      size="sm"
                      onClick={() => runAction("storytelling_rewrite")}
                    >
                      Add storytelling
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <label className="text-xs text-slate-400">
                  AI Command Bar (Cursor style)
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 flex-1">
                    <Terminal className="h-4 w-4 text-slate-500" />
                    <input
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      className="h-full w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                      placeholder='Try: "make this more technical"'
                    />
                  </div>
                  <Button onClick={runCommandBar}>
                    <ArrowRight className="h-4 w-4" />
                    Run
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-5">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary-400" />
                <h3 className="text-sm font-semibold text-white">
                  Context + Actions Panel
                </h3>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-surface-light/30 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
                    Active Context
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <GitBranch className="h-4 w-4 text-primary-400" />
                    selected repo: `LinkedIN helper`
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    current task: {activeTask}
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-surface-light/30 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
                    User Intelligence
                  </p>
                  <p className="text-sm text-slate-200">
                    career goal: backend role with stronger public proof
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    strengths: system thinking, execution
                  </p>
                  <p className="text-xs text-slate-400">
                    weakness: under-marketing project impact
                  </p>
                  <p className="text-xs text-slate-400">tone: technical + clear</p>
                </div>

                <div className="rounded-lg border border-border bg-surface-light/30 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
                    Memory Signals
                  </p>
                  <p className="text-xs text-slate-400">
                    worked before: concise frameworks and practical takeaways
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    rejected before: generic motivational content
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                {quickActions.map((actionId) => (
                  <Button
                    key={actionId}
                    className="w-full justify-start"
                    variant="secondary"
                    onClick={() => runAction(actionId)}
                  >
                    <Zap className="h-4 w-4" />
                    {actionLabels[actionId]}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AIResponseBlock } from "@/components/ai-studio/ai-response-block";
import { PromptInputBox } from "@/components/ai-studio/prompt-input-box";
import type { RepositorySummary } from "@/stores/careeros.store";

interface AIChatPanelProps {
  selectedRepository?: RepositorySummary;
}

type ChatMessage = {
  id: string;
  title: string;
  content: string;
  tone: "insight" | "actionable";
};

export function AIChatPanel({ selectedRepository }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "seed-1",
      title: "AI insight",
      content: "Your repository architecture suggests strong backend ownership potential.",
      tone: "insight",
    },
  ]);

  const repositoryContext = useMemo(
    () => selectedRepository?.fullName ?? "No repository selected",
    [selectedRepository],
  );

  function onPrompt(prompt: string) {
    const response: ChatMessage = {
      id: crypto.randomUUID(),
      title: "AI response",
      content: `Using context from ${repositoryContext}, I suggest focusing this prompt on measurable outcomes: "${prompt}".`,
      tone: "actionable",
    };
    setMessages((prev) => [...prev, response]);
  }

  return (
    <div className="space-y-3">
      <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {messages.map((message) => (
          <AIResponseBlock key={message.id} title={message.title} content={message.content} tone={message.tone} />
        ))}
      </div>
      <PromptInputBox onSubmit={onPrompt} />
    </div>
  );
}

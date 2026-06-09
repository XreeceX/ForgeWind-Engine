'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PromptInputBox } from '@/components/ai-studio/prompt-input-box';
import type { RepositorySummary } from '@/stores/forgewind.store';

interface AIChatPanelProps {
  selectedRepository?: RepositorySummary;
}

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function AIChatPanel({ selectedRepository }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const repoContext = selectedRepository?.fullName ?? null;

  function onPrompt(prompt: string) {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
    };
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content:
        'AI-powered responses are coming soon. In the meantime, try syncing a repository from the Overview page to build your career context.',
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
          <Sparkles className="mb-3 h-8 w-8 text-primary-400/60" />
          <p className="text-sm font-medium text-foreground">ForgeWind AI Copilot</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            {repoContext
              ? `Ask anything about your career or ${repoContext}.`
              : 'Connect a repository first to unlock context-aware responses.'}
          </p>
        </div>
      ) : (
        <div className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'ml-8 bg-primary-500/10 text-foreground'
                  : 'mr-8 border border-border bg-surface text-muted-foreground'
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
      )}
      <PromptInputBox onSubmit={onPrompt} />
    </div>
  );
}

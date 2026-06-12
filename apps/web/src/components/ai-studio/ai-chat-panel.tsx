'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { PromptInputBox } from '@/components/ai-studio/prompt-input-box';
import { forgeWindJson, getForgeWindApiBaseUrl } from '@/lib/forgewind-api';
import { useForgeWindAccessToken } from '@/hooks/use-forgewind-access-token';
import type { RepositorySummary } from '@/stores/forgewind.store';
import toast from 'react-hot-toast';

interface AIChatPanelProps {
  selectedRepository?: RepositorySummary;
}

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function AIChatPanel({ selectedRepository }: AIChatPanelProps) {
  const accessToken = useForgeWindAccessToken();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const repoContext = selectedRepository?.fullName ?? null;
  const apiReady = !!getForgeWindApiBaseUrl() && !!accessToken;

  async function onPrompt(prompt: string) {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      if (!apiReady) {
        throw new Error('AI is unavailable — sign in and ensure the ForgeWind API is configured.');
      }

      const result = await forgeWindJson<{ content: string }>('/ai/chat', {
        method: 'POST',
        accessToken,
        body: JSON.stringify({
          message: prompt,
          ...(repoContext ? { repoContext } : {}),
        }),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.content,
        },
      ]);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      toast.error(message);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: message,
        },
      ]);
    } finally {
      setLoading(false);
    }
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
              : 'Connect a repository in Data Hub for richer, context-aware answers.'}
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
                  : 'mr-8 border border-border bg-surface text-foreground/90'
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="mr-8 flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking…
            </div>
          )}
        </div>
      )}
      <PromptInputBox onSubmit={onPrompt} disabled={loading} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PromptInputBoxProps {
  placeholder?: string;
  disabled?: boolean;
  onSubmit: (prompt: string) => void;
}

export function PromptInputBox({
  placeholder = "Ask AI to analyze your selected repository...",
  disabled = false,
  onSubmit,
}: PromptInputBoxProps) {
  const [prompt, setPrompt] = useState("");

  function submit() {
    const trimmed = prompt.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setPrompt("");
  }

  return (
    <div className="rounded-xl border border-border bg-surface-light/70 p-3 transition-colors duration-200 focus-within:border-primary-500/40">
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder={placeholder}
        rows={3}
        disabled={disabled}
        className="w-full resize-none bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-slate-500">Enter to run prompt, Shift+Enter for newline</p>
        <Button size="sm" onClick={submit} disabled={disabled || !prompt.trim()}>
          <ArrowUp className="h-3.5 w-3.5" />
          Send
        </Button>
      </div>
    </div>
  );
}

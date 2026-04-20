"use client";

import { Button } from "@/components/ui/button";
import { ParticleCanvas } from "@/components/workspace/particle-canvas";
import { cn } from "@/lib/cn";

interface WorkModeBannerProps {
  onOpenChat: () => void;
  onGeneratePost: () => void;
  onCinematic: () => void;
  className?: string;
}

export function WorkModeBanner({
  onOpenChat,
  onGeneratePost,
  onCinematic,
  className,
}: WorkModeBannerProps) {
  return (
    <div
      className={cn(
        "relative min-h-[140px] overflow-hidden rounded-fw-card border border-fw-gray-100 bg-fw-white shadow-sm",
        className,
      )}
    >
      <ParticleCanvas className="opacity-70" />
      <div className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-1 bg-fw-orange" aria-hidden />
      <div className="relative z-[2] flex flex-col gap-4 p-6 pl-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-fw-orange">
            Work mode
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-fw-gray-900">ForgeWind workspace</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md" onClick={onOpenChat}>
            Open AI Chat
          </Button>
          <GeneratePostButton onClick={onGeneratePost} />
          <Button variant="ghost" size="md" onClick={onCinematic}>
            Cinematic Mode
          </Button>
        </div>
      </div>
    </div>
  );
}

function GeneratePostButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="inline-flex overflow-hidden rounded-fw-btn p-[2px] animate-fw-spin-slow bg-[conic-gradient(from_0deg,#F97316,#FED7AA,#EA580C,#F97316)]">
      <div className="animate-fw-spin-slow-reverse rounded-[6px] bg-fw-white">
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "block w-full px-5 py-2.5 text-center text-sm font-medium text-fw-orange",
            "transition-colors duration-200 hover:bg-fw-orange-light",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fw-orange focus-visible:ring-offset-2",
          )}
        >
          Generate Post
        </button>
      </div>
    </div>
  );
}

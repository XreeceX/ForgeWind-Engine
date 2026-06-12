'use client';

import { Button } from '@/components/ui/button';
import { ParticleCanvas } from '@/components/workspace/particle-canvas';
import { cn } from '@/lib/cn';

interface WorkModeBannerProps {
  onOpenChat: () => void;
  onGeneratePost: () => void;
  greeting?: string;
  className?: string;
}

export function WorkModeBanner({
  onOpenChat,
  onGeneratePost,
  greeting,
  className,
}: WorkModeBannerProps) {
  return (
    <div
      className={cn(
        'relative min-h-[140px] overflow-hidden rounded-fw-card border border-border bg-panel shadow-sm',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-fw-card"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-fw-orange-light/60 via-transparent to-amber-100/30 dark:from-fw-orange/10 dark:to-amber-500/5" />
        <ParticleCanvas className="opacity-70" />
      </div>
      <div
        className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-1 bg-gradient-to-b from-fw-orange to-amber-400"
        aria-hidden
      />
      <div className="relative z-[2] flex flex-col gap-4 p-6 pl-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-fw-orange">Work mode</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {greeting ?? 'ForgeWind workspace'}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md" onClick={onOpenChat}>
            Open AI Chat
          </Button>
          <Button variant="primary" size="md" className="shrink-0" onClick={onGeneratePost}>
            Generate Post
          </Button>
        </div>
      </div>
    </div>
  );
}

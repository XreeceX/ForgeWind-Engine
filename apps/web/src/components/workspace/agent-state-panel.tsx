'use client';

import { cn } from '@/lib/cn';

type AgentStatus = 'ready' | 'running' | 'idle' | 'error';

interface TimelineItem {
  id: string;
  time: string;
  label: string;
}

const defaultTimeline: TimelineItem[] = [
  { id: '1', time: '2m ago', label: 'Profile Optimizer refreshed headline suggestions' },
  { id: '2', time: '14m ago', label: 'Job Matcher scored 8 new remote roles' },
  { id: '3', time: '1h ago', label: 'Content Writer drafted LinkedIn post variant B' },
];

export function AgentStatePanel({
  status,
  statusLabel,
  detail,
  timeline = defaultTimeline,
  className,
}: {
  status: AgentStatus;
  statusLabel: string;
  detail?: string;
  timeline?: TimelineItem[];
  className?: string;
}) {
  const ready = status === 'ready';
  const working = status === 'running';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-fw-card border border-border bg-panel',
        className,
      )}
    >
      <div className="h-1 w-full bg-gradient-to-r from-fw-orange to-amber-400" aria-hidden />
      <div className="p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-fw-orange">Agent state</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex h-2.5 w-2.5 shrink-0 rounded-full',
              ready && 'bg-success animate-fw-pulse-ready',
              working && 'bg-fw-orange animate-fw-pulse-work',
              !ready && !working && 'bg-muted-foreground',
            )}
            aria-hidden
          />
          <p className="text-sm font-medium text-foreground">{statusLabel}</p>
        </div>
        {detail ? (
          <p className="mt-3 rounded-fw-btn border border-border bg-surface-light px-3 py-2 text-xs text-foreground">
            {detail}
          </p>
        ) : null}

        <div className="relative mt-6 border-l border-border pl-4">
          {timeline.map((item) => (
            <div key={item.id} className="relative pb-5 last:pb-0">
              <span
                className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-panel bg-fw-orange-mid"
                aria-hidden
              />
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {item.time}
              </p>
              <p className="mt-0.5 text-sm text-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

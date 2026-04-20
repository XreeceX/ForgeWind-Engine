"use client";

import { useCountUpOnView } from "@/lib/hooks/use-count-up-on-view";
import { cn } from "@/lib/cn";

interface StatProps {
  label: string;
  value: number;
  decimals?: number;
}

function StatCard({ label, value, decimals = 0 }: StatProps) {
  const { ref, value: shown } = useCountUpOnView(value, { duration: 900, decimals });

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-fw-card border border-fw-gray-100 border-b-[3px] border-b-fw-orange bg-fw-white px-5 py-4",
      )}
    >
      <p className="font-mono text-3xl font-semibold tabular-nums text-fw-gray-900">{shown}</p>
      <p className="mt-1 text-sm text-fw-gray-400">{label}</p>
    </div>
  );
}

export function WorkspaceStatRow({
  repoCount,
  workflowCount,
  healthAvg,
  postsGenerated,
  className,
}: {
  repoCount: number;
  workflowCount: number;
  healthAvg: number;
  postsGenerated: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 lg:grid-cols-4", className)}>
      <StatCard label="Repositories" value={repoCount} />
      <StatCard label="Active workflows" value={workflowCount} />
      <StatCard label="Health avg" value={healthAvg} />
      <StatCard label="Posts generated" value={postsGenerated} />
    </div>
  );
}

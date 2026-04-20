import { Card } from "@/components/ui/card";
import type { MemoryContext, RepositorySummary, UserProfile } from "@/stores/forgewind.store";

interface ContextPanelProps {
  userProfile: UserProfile;
  selectedRepository?: RepositorySummary;
  memoryContext: MemoryContext;
}

export function ContextPanel({ userProfile, selectedRepository, memoryContext }: ContextPanelProps) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-fw-orange">Live context</p>
      <div className="mt-3 space-y-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">User goal</p>
          <p className="mt-0.5 font-medium leading-snug text-foreground">{userProfile.primaryGoal}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Selected repository</p>
          <p className="mt-0.5 font-mono text-sm font-medium leading-snug text-fw-gray-900">
            {selectedRepository?.fullName ?? "No repository selected"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Preferred tone</p>
          <p className="mt-0.5 font-medium leading-snug text-foreground">{memoryContext.preferredTone}</p>
        </div>
      </div>
    </Card>
  );
}

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
      <p className="text-xs uppercase tracking-wide text-slate-500">Live context</p>
      <div className="mt-3 space-y-3 text-sm">
        <div>
          <p className="text-xs text-slate-500">User goal</p>
          <p className="text-slate-200">{userProfile.primaryGoal}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Selected repository</p>
          <p className="text-slate-200">{selectedRepository?.fullName ?? "No repository selected"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Preferred tone</p>
          <p className="text-slate-200">{memoryContext.preferredTone}</p>
        </div>
      </div>
    </Card>
  );
}

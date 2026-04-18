"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCareerOSStore } from "@/stores/careeros.store";

export default function SettingsPage() {
  const userProfile = useCareerOSStore((state) => state.userProfile);
  const memoryContext = useCareerOSStore((state) => state.memoryContext);
  const updateMemoryContext = useCareerOSStore((state) => state.updateMemoryContext);
  const [tone, setTone] = useState(memoryContext.preferredTone);

  return (
    <div className="max-w-3xl space-y-6">
      <Card className="p-5">
        <p className="text-sm font-semibold text-white">User profile</p>
        <p className="mt-1 text-sm text-slate-300">{userProfile.name}</p>
        <p className="text-xs text-slate-400">{userProfile.headline}</p>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-semibold text-white">Memory defaults</p>
        <p className="mt-1 text-xs text-slate-500">Preferred tone influences AI generation across studio and content pages.</p>
        <input
          value={tone}
          onChange={(event) => setTone(event.target.value)}
          className="mt-3 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-slate-100 outline-none focus:border-primary-500/40"
        />
        <div className="mt-3 flex justify-end">
          <Button
            onClick={() => {
              updateMemoryContext({ preferredTone: tone });
            }}
          >
            Save preferences
          </Button>
        </div>
      </Card>
    </div>
  );
}

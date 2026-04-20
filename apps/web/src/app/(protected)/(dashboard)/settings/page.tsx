"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useForgeWindStore } from "@/stores/forgewind.store";

export default function SettingsPage() {
  const userProfile = useForgeWindStore((state) => state.userProfile);
  const memoryContext = useForgeWindStore((state) => state.memoryContext);
  const updateMemoryContext = useForgeWindStore((state) => state.updateMemoryContext);
  const [tone, setTone] = useState(memoryContext.preferredTone);

  return (
    <div className="max-w-3xl space-y-6">
      <Card className="p-5">
        <p className="text-sm font-semibold text-foreground">User profile</p>
        <p className="mt-1 text-sm text-fw-gray-700">{userProfile.name}</p>
        <p className="text-xs text-muted-foreground">{userProfile.headline}</p>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-semibold text-foreground">Memory defaults</p>
        <p className="mt-1 text-xs text-muted-foreground">Preferred tone influences AI generation across studio and content pages.</p>
        <input
          value={tone}
          onChange={(event) => setTone(event.target.value)}
          className="mt-3 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/25"
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

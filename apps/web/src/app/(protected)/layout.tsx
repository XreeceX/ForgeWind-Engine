import { ForgeWindApiBootstrap } from '@/components/layout/forgewind-api-bootstrap';
import { ProtectedSessionGate } from '@/components/layout/protected-session-gate';
import { SyncSessionToStore } from '@/components/layout/sync-session-to-store';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedSessionGate>
      <>
        <SyncSessionToStore />
        <ForgeWindApiBootstrap />
        {children}
      </>
    </ProtectedSessionGate>
  );
}

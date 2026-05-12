import { ForgeWindApiBootstrap } from "@/components/layout/forgewind-api-bootstrap";
import { ProtectedSessionGate } from "@/components/layout/protected-session-gate";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedSessionGate>
      <>
        <ForgeWindApiBootstrap />
        {children}
      </>
    </ProtectedSessionGate>
  );
}

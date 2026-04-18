import { ProtectedSessionGate } from "@/components/layout/protected-session-gate";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedSessionGate>{children}</ProtectedSessionGate>;
}

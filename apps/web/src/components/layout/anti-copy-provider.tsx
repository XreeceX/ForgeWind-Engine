"use client";

import { usePathname } from "next/navigation";
import { useAntiCopy } from "@/hooks/use-anti-copy";

const PUBLIC_AUTH_PATHS = ["/login", "/signup", "/forgot-password"] as const;

function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Enables useAntiCopy on session-protected UI only (not on login/signup/forgot). */
export function AntiCopyProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const enabled = !isPublicAuthPath(pathname);

  useAntiCopy(enabled);

  return <>{children}</>;
}

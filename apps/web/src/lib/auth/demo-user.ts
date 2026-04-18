import { timingSafeEqual } from "node:crypto";

/**
 * ForgeWind credentials auth — values from env in production.
 * `FORGEWIND_DEMO_USERNAME` / `FORGEWIND_DEMO_PASSWORD` (never commit real secrets).
 */
export function getForgeWindDemoAuth() {
  return {
    username: (process.env.FORGEWIND_DEMO_USERNAME ?? "rod").trim(),
    password: (process.env.FORGEWIND_DEMO_PASSWORD ?? "rod8989").trim(),
  };
}

export function timingSafeStringEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export const DEMO_USER = {
  id: "forgewind-session-user",
  email: "rod@forgewind.local",
  name: "Rod",
  linkedinConnected: false,
} as const;

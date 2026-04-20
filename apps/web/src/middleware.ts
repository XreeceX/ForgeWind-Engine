import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getNextAuthSecret } from "@/lib/auth/auth-secret";

/**
 * ForgeWind demo — Edge middleware (order matters)
 * 1) Block known AI / crawler / script user agents (plain 403)
 * 2) Allow static assets & explicit public routes
 * 3) Require NextAuth JWT for everything else → redirect to /login
 */

const BLOCKED_USER_AGENT_SNIPPETS = [
  "gptbot",
  "chatgpt-user",
  "claudebot",
  "claude-web",
  "anthropic",
  "ccbot",
  "perplexitybot",
  "youbot",
  "cohere-ai",
  "meta-externalagent",
  "bytespider",
  "petalbot",
  "semrushbot",
  "ahrefsbot",
  "dataforseobot",
  "python-requests",
  "curl/",
  "wget/",
  "scrapy",
  "axios/",
] as const;

function isBlockedBotUserAgent(userAgent: string): boolean {
  const lower = userAgent.toLowerCase();
  return BLOCKED_USER_AGENT_SNIPPETS.some((needle) => lower.includes(needle));
}

/** Paths that skip both bot handling quirks and auth (always allowed through if not bot). */
const PUBLIC_PATH_PREFIXES = [
  "/login",
  "/forgot-password",
  "/api/auth",
  "/neon-comments",
] as const;

function isPublicPath(pathname: string): boolean {
  if (pathname === "/favicon.ico") return true;
  if (pathname.startsWith("/_next")) return true;
  return PUBLIC_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";

  // Layer 2 — block scrapers & known AI crawlers before any redirect
  if (userAgent && isBlockedBotUserAgent(userAgent)) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const { pathname } = request.nextUrl;

  if (pathname === "/signup" || pathname.startsWith("/signup/")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Layer 1 — require session for all other routes
  const token = await getToken({
    req: request,
    secret: getNextAuthSecret(),
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * All paths except Next.js internals, favicon, extensioned static files,
     * and robots.txt from /public (keep middleware aligned with isPublicPath checks).
     */
    "/",
    "/((?!_next/|favicon.ico|robots.txt|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|txt)$).*)",
  ],
};

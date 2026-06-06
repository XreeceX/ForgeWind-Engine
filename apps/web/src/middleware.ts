import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/auth.config';

/**
 * ForgeWind demo — Edge middleware
 * 1) Block known AI / crawler / script user agents (plain 403)
 * 2) Auth.js v5 `authorized` callback (auth.config.ts) protects routes
 *
 * Uses authConfig only (Edge-safe) — do not import `@/auth` here (Node crypto in authorize).
 */

const BLOCKED_USER_AGENT_SNIPPETS = [
  'gptbot',
  'chatgpt-user',
  'claudebot',
  'claude-web',
  'anthropic',
  'ccbot',
  'perplexitybot',
  'youbot',
  'cohere-ai',
  'meta-externalagent',
  'bytespider',
  'petalbot',
  'semrushbot',
  'ahrefsbot',
  'dataforseobot',
  'python-requests',
  'curl/',
  'wget/',
  'scrapy',
  'axios/',
] as const;

function isBlockedBotUserAgent(userAgent: string): boolean {
  const lower = userAgent.toLowerCase();
  return BLOCKED_USER_AGENT_SNIPPETS.some((needle) => lower.includes(needle));
}

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const userAgent = request.headers.get('user-agent') ?? '';

  if (userAgent && isBlockedBotUserAgent(userAgent)) {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const { pathname } = request.nextUrl;

  if (pathname === '/signup' || pathname.startsWith('/signup/')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/',
    '/((?!_next/|favicon.ico|robots.txt|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|txt)$).*)',
  ],
};

import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const BLOCKED_UA_SNIPPETS = [
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

function isBlockedBot(ua: string): boolean {
  const lower = ua.toLowerCase();
  return BLOCKED_UA_SNIPPETS.some((s) => lower.includes(s));
}

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const ua = request.headers.get('user-agent') ?? '';
  if (ua && isBlockedBot(ua)) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/|favicon\\.ico$|robots\\.txt$|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|txt)$).*)',
  ],
};

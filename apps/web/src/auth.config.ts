import type { NextAuthConfig } from 'next-auth';

/** Paths that do not require authentication. */
const PUBLIC_PREFIXES = ['/login', '/signup', '/api/auth'] as const;

function isPublicPath(pathname: string): boolean {
  if (pathname === '/favicon.ico') return true;
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/public/')) return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Edge-safe Auth.js config used by middleware.
 * No Node.js imports, no fetch calls to backend services.
 * The full jwt/session callbacks live in auth.ts (Node runtime).
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    // Max age matches JWT_REFRESH_EXPIRY (7d) so the session stays alive as long as tokens can refresh.
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (isPublicPath(pathname)) return true;
      return !!auth?.user;
    },
  },
};

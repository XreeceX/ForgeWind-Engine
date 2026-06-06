import type { NextAuthConfig } from 'next-auth';

const PUBLIC_PATH_PREFIXES = ['/login', '/forgot-password', '/api/auth', '/neon-comments'] as const;

function isPublicPath(pathname: string): boolean {
  if (pathname === '/favicon.ico') return true;
  if (pathname.startsWith('/_next')) return true;
  if (pathname === '/signup' || pathname.startsWith('/signup/')) return true;
  return PUBLIC_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (isPublicPath(pathname)) {
        return true;
      }
      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = user.accessToken ?? null;
        token.refreshToken = user.refreshToken ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.email = token.email ?? session.user.email;
        session.user.name = token.name ?? session.user.name;
      }
      session.accessToken =
        typeof token.accessToken === 'string' ? token.accessToken : null;
      session.refreshToken =
        typeof token.refreshToken === 'string' ? token.refreshToken : null;
      return session;
    },
  },
};

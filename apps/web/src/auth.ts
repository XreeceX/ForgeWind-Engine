import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getNextAuthSecret } from '@/lib/auth/auth-secret';
import { DEMO_USER } from '@/lib/auth/demo-user';
import {
  getForgeWindDemoAuth,
  timingSafeStringEqual,
} from '@/lib/auth/forge-wind-demo-credentials';
import { getUserServiceUrl } from '@/lib/forgewind-api';

async function loginViaUserService(email: string, password: string) {
  const response = await fetch(`${getUserServiceUrl()}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<{
    user: { id: string; email: string; firstName: string; lastName: string };
    tokens: { accessToken: string; refreshToken: string };
  }>;
}

const nextAuth = NextAuth({
  secret: getNextAuthSecret(),
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        username: { label: 'Username', type: 'text' },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === 'string'
            ? credentials.email.trim().toLowerCase()
            : undefined;
        const password =
          typeof credentials?.password === 'string' ? credentials.password : undefined;
        const username =
          typeof credentials?.username === 'string'
            ? credentials.username.trim().toLowerCase()
            : undefined;

        if (email && password) {
          try {
            const result = await loginViaUserService(email, password);
            if (result) {
              return {
                id: result.user.id,
                email: result.user.email,
                name: `${result.user.firstName} ${result.user.lastName}`.trim(),
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
              };
            }
          } catch {
            // Fall through to demo credentials when user-service is unavailable.
          }
        }

        if (!username || !password) return null;

        const { username: expectedUser, password: expectedPassword } = getForgeWindDemoAuth();
        if (username !== expectedUser.toLowerCase()) return null;
        if (!timingSafeStringEqual(password, expectedPassword)) return null;

        return {
          id: DEMO_USER.id,
          email: DEMO_USER.email,
          name: DEMO_USER.name,
          accessToken: null,
          refreshToken: null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = user.accessToken ?? null;
        token.refreshToken = user.refreshToken ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.email = token.email ?? session.user.email;
        session.user.name = token.name ?? session.user.name;
      }
      session.accessToken = token.accessToken ?? null;
      session.refreshToken = token.refreshToken ?? null;
      return session;
    },
  },
});

export const { handlers } = nextAuth;

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getNextAuthSecret } from '@/lib/auth/auth-secret';
import { DEMO_USER } from '@/lib/auth/demo-user';
import {
  getForgeWindDemoAuth,
  timingSafeStringEqual,
} from '@/lib/auth/forge-wind-demo-credentials';
import { getUserServiceUrl } from '@/lib/forgewind-api';
import { authConfig } from '@/auth.config';

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
  ...authConfig,
  secret: getNextAuthSecret(),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        username: { label: 'Username', type: 'text' },
      },
      async authorize(credentials) {
        const password =
          typeof credentials?.password === 'string' ? credentials.password.trim() : undefined;
        if (!password) return null;

        const email =
          typeof credentials?.email === 'string'
            ? credentials.email.trim().toLowerCase()
            : undefined;
        const username =
          typeof credentials?.username === 'string'
            ? credentials.username.trim().toLowerCase()
            : undefined;

        const { username: expectedUser, password: expectedPassword } = getForgeWindDemoAuth();
        const demoEmail = DEMO_USER.email.toLowerCase();
        const demoLoginId = username || email;

        if (
          demoLoginId &&
          (demoLoginId === expectedUser || demoLoginId === demoEmail)
        ) {
          if (!timingSafeStringEqual(password, expectedPassword)) return null;
          return {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
            name: DEMO_USER.name,
            accessToken: null,
            refreshToken: null,
          };
        }

        const emailLogin = email || (username?.includes('@') ? username : undefined);

        if (emailLogin) {
          try {
            const result = await loginViaUserService(emailLogin, password);
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
            // user-service unreachable
          }
          return null;
        }

        return null;
      },
    }),
  ],
});

export const { handlers, auth, signIn } = nextAuth;

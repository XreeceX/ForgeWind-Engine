import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import LinkedIn from 'next-auth/providers/linkedin';
import { authConfig } from '@/auth.config';
import { getUserServiceUrl } from '@/lib/forgewind-api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseAccessExpiry(expiryStr: string): number {
  const match = expiryStr.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000;
  const [, val, unit] = match;
  const n = parseInt(val ?? '15', 10);
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return n * (multipliers[unit ?? 'm'] ?? 60_000);
}

function nextAccessTokenExpiry(): number {
  const expiry = process.env.JWT_ACCESS_EXPIRY ?? '15m';
  // Refresh 1 minute before the actual expiry to avoid race conditions.
  return Date.now() + parseAccessExpiry(expiry) - 60_000;
}

// ---------------------------------------------------------------------------
// User-service API calls (Node.js only — not used in Edge middleware)
// ---------------------------------------------------------------------------

interface UserServiceAuthResult {
  user: { id: string; email: string; firstName: string; lastName: string };
  tokens: { accessToken: string; refreshToken: string };
}

async function loginViaCredentials(
  email: string,
  password: string,
): Promise<{ result: UserServiceAuthResult | null; serviceDown: boolean }> {
  try {
    const res = await fetch(`${getUserServiceUrl()}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.status === 401) return { result: null, serviceDown: false };
    if (!res.ok) return { result: null, serviceDown: true };

    return { result: (await res.json()) as UserServiceAuthResult, serviceDown: false };
  } catch {
    return { result: null, serviceDown: true };
  }
}

async function exchangeOAuthWithUserService(
  provider: 'GOOGLE' | 'LINKEDIN',
  email: string,
  name: string,
  avatarUrl?: string | null,
): Promise<UserServiceAuthResult | null> {
  const [firstName = '', ...rest] = name.trim().split(' ');
  const lastName = rest.join(' ') || firstName;

  try {
    const res = await fetch(`${getUserServiceUrl()}/api/v1/auth/oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, email, firstName, lastName, avatarUrl }),
    });
    if (!res.ok) return null;
    return (await res.json()) as UserServiceAuthResult;
  } catch {
    return null;
  }
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await fetch(`${getUserServiceUrl()}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken: string; refreshToken: string };
    return data;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// NextAuth instance
// ---------------------------------------------------------------------------

const nextAuth = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim(),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === 'string' ? credentials.email.trim().toLowerCase() : null;
        const password =
          typeof credentials?.password === 'string' ? credentials.password.trim() : null;

        if (!email || !password) return null;

        const { result } = await loginViaCredentials(email, password);
        if (!result) return null;

        return {
          id: result.user.id,
          email: result.user.email,
          name: `${result.user.firstName} ${result.user.lastName}`.trim(),
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID ?? '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // --- Initial sign-in via credentials ---
      if (user && account?.provider === 'credentials') {
        const u = user as typeof user & {
          accessToken?: string | null;
          refreshToken?: string | null;
        };
        token.sub = u.id ?? token.sub;
        token.email = u.email ?? token.email;
        token.name = u.name ?? token.name;
        token.accessToken = u.accessToken ?? null;
        token.refreshToken = u.refreshToken ?? null;
        token.accessTokenExpiry = nextAccessTokenExpiry();
        return token;
      }

      // --- Initial sign-in via OAuth ---
      if (user && account && (account.provider === 'google' || account.provider === 'linkedin')) {
        const provider = account.provider === 'google' ? 'GOOGLE' : 'LINKEDIN';
        const result = await exchangeOAuthWithUserService(
          provider,
          user.email ?? '',
          user.name ?? '',
          user.image,
        );

        if (result) {
          token.sub = result.user.id;
          token.email = result.user.email;
          token.name = `${result.user.firstName} ${result.user.lastName}`.trim();
          token.accessToken = result.tokens.accessToken;
          token.refreshToken = result.tokens.refreshToken;
          token.accessTokenExpiry = nextAccessTokenExpiry();
        }
        return token;
      }

      // --- Subsequent requests: refresh access token if near expiry ---
      const expiry = typeof token.accessTokenExpiry === 'number' ? token.accessTokenExpiry : 0;
      const hasRefresh = typeof token.refreshToken === 'string' && token.refreshToken;

      if (hasRefresh && expiry && Date.now() > expiry) {
        const refreshed = await refreshAccessToken(token.refreshToken as string);
        if (refreshed) {
          token.accessToken = refreshed.accessToken;
          token.refreshToken = refreshed.refreshToken;
          token.accessTokenExpiry = nextAccessTokenExpiry();
        } else {
          // Refresh failed — clear backend tokens but keep the session alive.
          // Protected API calls will return 401 and the user can re-authenticate.
          token.accessToken = null;
          token.refreshToken = null;
          token.accessTokenExpiry = null;
        }
      }

      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.email = token.email ?? session.user.email;
        session.user.name = token.name ?? session.user.name;
      }
      session.accessToken = typeof token.accessToken === 'string' ? token.accessToken : null;
      session.refreshToken = typeof token.refreshToken === 'string' ? token.refreshToken : null;
      return session;
    },
  },
});

export const { handlers, auth, signIn, signOut } = nextAuth;

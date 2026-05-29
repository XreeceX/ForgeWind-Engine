import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
    accessToken: string | null;
    refreshToken: string | null;
  }

  interface User {
    accessToken?: string | null;
    refreshToken?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string | null;
    refreshToken?: string | null;
  }
}

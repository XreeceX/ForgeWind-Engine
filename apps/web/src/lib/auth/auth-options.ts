import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getNextAuthSecret } from "@/lib/auth/auth-secret";
import { DEMO_USER } from "@/lib/auth/demo-user";
import {
  getForgeWindDemoAuth,
  timingSafeStringEqual,
} from "@/lib/auth/forge-wind-demo-credentials";

export const authOptions: NextAuthOptions = {
  secret: getNextAuthSecret(),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim().toLowerCase();
        const password = credentials?.password;

        if (!username || !password) return null;

        const { username: expectedUser, password: expectedPassword } = getForgeWindDemoAuth();
        if (username !== expectedUser.toLowerCase()) return null;
        if (!timingSafeStringEqual(password, expectedPassword)) return null;

        return {
          id: DEMO_USER.id,
          email: DEMO_USER.email,
          name: DEMO_USER.name,
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = token.email ?? session.user.email;
        session.user.name = token.name ?? session.user.name;
      }
      return session;
    },
  },
};

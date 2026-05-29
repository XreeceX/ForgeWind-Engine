/** Shared secret for NextAuth — must match JWT signing in API routes and Edge middleware. */
export function getNextAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET must be set in production');
  }

  return 'forgewind-demo-nextauth-secret-change-in-env';
}

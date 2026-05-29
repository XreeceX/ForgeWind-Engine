/** Shared secret for NextAuth — must match JWT signing in API routes and Edge middleware. */
export function getNextAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
  if (secret) {
    return secret;
  }

  // Next.js sets NODE_ENV=production during `next build`; allow that phase to finish.
  const isProductionBuild = process.env.NEXT_PHASE === 'phase-production-build';

  if (process.env.NODE_ENV === 'production' && !isProductionBuild) {
    throw new Error('NEXTAUTH_SECRET must be set in production');
  }

  return 'forgewind-demo-nextauth-secret-change-in-env';
}

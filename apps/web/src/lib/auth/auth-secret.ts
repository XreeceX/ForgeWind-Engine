/**
 * NextAuth secret — required in all environments.
 * Set AUTH_SECRET or NEXTAUTH_SECRET in your environment.
 */
export function getNextAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
  if (secret) return secret;

  // Allow `next build` to complete without the secret (env not available at build time).
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return '__build_placeholder__';
  }

  throw new Error(
    'Missing AUTH_SECRET (or NEXTAUTH_SECRET). Set this environment variable before starting the app.',
  );
}

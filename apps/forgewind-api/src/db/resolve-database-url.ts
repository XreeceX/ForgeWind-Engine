/**
 * Vercel + Neon Storage often injects a suffixed var (e.g. STORAGE_URL) when DATABASE_URL
 * already exists. Prefer DATABASE_URL; fall back to STORAGE_URL.
 */
export function resolveDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const url = env.DATABASE_URL?.trim() || env.STORAGE_URL?.trim();
  if (!url) {
    throw new Error(
      'Set DATABASE_URL or STORAGE_URL (Vercel Neon with a custom prefix uses STORAGE_URL).',
    );
  }
  return url;
}

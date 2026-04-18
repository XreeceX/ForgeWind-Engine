/** Shared secret for NextAuth — must match JWT signing in API routes and Edge middleware. */
export function getNextAuthSecret(): string {
  return process.env.NEXTAUTH_SECRET ?? "careeros-demo-nextauth-secret-change-in-env";
}

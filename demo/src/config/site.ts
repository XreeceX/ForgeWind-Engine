/**
 * Optional public contact links (set in Vercel env if you use them).
 */
export const site = {
  product: "ForgeWind",
  location: "Remote-first",
  year: 2026,

  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? "",
  linkedInUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim() ?? "",
} as const;

export function mailtoCollaborate(subject = "ForgeWind — ideas or collaboration") {
  if (!site.contactEmail) return null;
  const q = new URLSearchParams({ subject });
  return `mailto:${site.contactEmail}?${q.toString()}`;
}

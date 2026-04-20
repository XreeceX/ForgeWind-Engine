/** Reject open redirects — only same-origin path segments allowed. */
export function safeCallbackPath(searchValue: string | null, fallback = "/forgewind-engine"): string {
  if (!searchValue) return fallback;
  const path = searchValue.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.includes("://") || path.includes("@")) return fallback;
  return path;
}

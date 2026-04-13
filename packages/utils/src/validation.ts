const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Checks if a string is a syntactically valid email address. */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/** Checks if a string is a valid URL with http or https protocol. */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Strips HTML tags and collapses whitespace from a string. */
export function sanitizeString(str: string): string {
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncates a string to `maxLength`, appending an ellipsis if truncated. */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

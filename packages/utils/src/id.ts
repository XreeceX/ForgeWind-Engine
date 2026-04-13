import { nanoid } from "nanoid";

/**
 * Generates a unique ID, optionally prefixed (e.g. "usr_abc123").
 * Uses nanoid for URL-safe, collision-resistant IDs.
 */
export function generateId(prefix?: string): string {
  const id = nanoid();
  return prefix ? `${prefix}_${id}` : id;
}

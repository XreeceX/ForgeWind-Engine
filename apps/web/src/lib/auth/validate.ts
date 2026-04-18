const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/** Letters, numbers, underscore, hyphen — typical username rules. */
const USERNAME_RE = /^[a-zA-Z0-9_-]{1,64}$/;

export function isValidUsername(value: string): boolean {
  return USERNAME_RE.test(value.trim());
}

export function meetsPasswordPolicy(value: string): boolean {
  return value.length >= 8;
}

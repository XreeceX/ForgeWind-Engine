'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function loginWithCredentials(
  usernameOrEmail: string,
  password: string,
): Promise<LoginResult> {
  const trimmed = usernameOrEmail.trim();
  const trimmedPassword = password.trim();
  if (!trimmed || !trimmedPassword) {
    return { ok: false, error: 'Invalid credentials' };
  }

  const isEmail = trimmed.includes('@');
  const credentials: Record<string, string> = { password: trimmedPassword };
  if (isEmail) {
    credentials.email = trimmed.toLowerCase();
  } else {
    credentials.username = trimmed.toLowerCase();
  }

  try {
    await signIn('credentials', {
      ...credentials,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: 'Invalid credentials' };
    }
    throw error;
  }
}

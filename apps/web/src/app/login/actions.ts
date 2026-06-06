'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { safeCallbackPath } from '@/lib/auth/safe-callback-path';

export type LoginResult = { ok: true } | { ok: false; error: string };

function isAuthFailureRedirect(responseUrl: unknown): boolean {
  if (typeof responseUrl !== 'string') return true;
  return responseUrl.includes('error=') || responseUrl.includes('CredentialsSignin');
}

export async function loginWithCredentials(
  usernameOrEmail: string,
  password: string,
  callbackUrl: string | null,
): Promise<LoginResult> {
  const trimmed = usernameOrEmail.trim();
  const trimmedPassword = password.trim();
  if (!trimmed || !trimmedPassword) {
    return { ok: false, error: 'Invalid credentials' };
  }

  const destination = safeCallbackPath(callbackUrl, '/forgewind-engine');
  const isEmail = trimmed.includes('@');
  const credentials: Record<string, string> = { password: trimmedPassword };
  if (isEmail) {
    credentials.email = trimmed.toLowerCase();
  } else {
    credentials.username = trimmed.toLowerCase();
  }

  try {
    const responseUrl = await signIn('credentials', {
      ...credentials,
      redirect: false,
      redirectTo: destination,
    });

    if (isAuthFailureRedirect(responseUrl)) {
      return { ok: false, error: 'Invalid credentials' };
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: 'Invalid credentials' };
    }
    throw error;
  }

  redirect(destination);
}

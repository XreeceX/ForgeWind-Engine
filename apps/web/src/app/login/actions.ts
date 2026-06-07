'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';
import { safeCallbackPath } from '@/lib/auth/safe-callback-path';
import { getUserServiceUrl } from '@/lib/forgewind-api';

export type LoginResult = { ok: true; redirectTo: string } | { ok: false; error: string };
export type RegisterResult = { ok: true; redirectTo: string } | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export async function loginWithCredentials(
  email: string,
  password: string,
  callbackUrl: string | null,
): Promise<LoginResult> {
  const normalised = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!normalised || !trimmedPassword) {
    return { ok: false, error: 'Email and password are required' };
  }

  const destination = safeCallbackPath(callbackUrl, '/forgewind-engine');

  try {
    // redirect: false — cookie IS set via next/headers cookies() before returning.
    // We then navigate on the client via window.location.href so the browser sends
    // the cookie in the subsequent request to /forgewind-engine, which the
    // middleware can then validate correctly.
    await signIn('credentials', {
      email: normalised,
      password: trimmedPassword,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: 'Invalid email or password' };
    }
    throw error;
  }

  return { ok: true, redirectTo: destination };
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  callbackUrl: string | null,
): Promise<RegisterResult> {
  const normalised = email.trim().toLowerCase();
  const trimmedPassword = password.trim();
  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();

  if (!normalised || !trimmedPassword || !trimmedFirst || !trimmedLast) {
    return { ok: false, error: 'All fields are required' };
  }

  if (trimmedPassword.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters' };
  }

  try {
    const res = await fetch(`${getUserServiceUrl()}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalised,
        password: trimmedPassword,
        firstName: trimmedFirst,
        lastName: trimmedLast,
      }),
    });

    if (res.status === 409) {
      return { ok: false, error: 'An account with that email already exists' };
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
      const msg = Array.isArray(body.message)
        ? body.message[0]
        : (body.message ?? 'Registration failed');
      return { ok: false, error: String(msg) };
    }
  } catch {
    return { ok: false, error: 'Could not reach the authentication service. Try again.' };
  }

  // Log the user in immediately after registration
  return loginWithCredentials(normalised, trimmedPassword, callbackUrl);
}

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { loginWithCredentials } from '@/app/login/actions';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthInput } from '@/components/auth/auth-input';
import { AuthButton } from '@/components/auth/auth-button';
import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { ForgeWindAuthMark } from '@/components/auth/forgewind-auth-mark';
import { isValidEmail } from '@/lib/auth/validate';

type FieldErrors = Partial<{ email: string; password: string }>;

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'Invalid email or password',
  OAuthAccountNotLinked: 'This email is already registered with a different sign-in method',
  OAuthSignin: 'OAuth sign-in failed. Please try again',
  Default: 'Authentication failed. Please try again',
};

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const authError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'linkedin' | null>(null);

  useEffect(() => {
    if (authError) {
      setSubmitError(
        ERROR_MESSAGES[authError] ?? ERROR_MESSAGES.Default ?? 'Authentication failed',
      );
    }
  }, [authError]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const trimmedEmail = email.trim();
    const next: FieldErrors = {};
    if (!trimmedEmail) next.email = 'Email is required';
    else if (!isValidEmail(trimmedEmail)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';

    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const result = await loginWithCredentials(trimmedEmail, password, callbackUrl);
      if (!result.ok) {
        setSubmitError(result.error);
        setLoading(false);
      } else {
        // Full-page navigation so the browser sends the session cookie in the
        // next request — client-side router.push() can miss it.
        window.location.href = result.redirectTo;
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  async function handleOAuth(provider: 'google' | 'linkedin') {
    setOauthLoading(provider);
    await signIn(provider, {
      callbackUrl: callbackUrl ?? '/forgewind-engine',
    });
  }

  const busy = loading || oauthLoading !== null;

  return (
    <AuthPageShell>
      <ForgeWindAuthMark />
      <AuthCard>
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-primary-400">Sign in</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
        </div>

        {/* OAuth buttons */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleOAuth('google')}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface-light px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-lighter disabled:opacity-50"
          >
            {oauthLoading === 'google' ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => handleOAuth('linkedin')}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface-light px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-lighter disabled:opacity-50"
          >
            {oauthLoading === 'linkedin' ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0077B5" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            )}
            Continue with LinkedIn
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-panel px-2 text-muted-foreground">or sign in with email</span>
          </div>
        </div>

        {/* Email / password form */}
        <form noValidate onSubmit={onSubmit} className="space-y-5">
          <AuthInput
            label="Email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />
          <AuthInput
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          {submitError ? (
            <p className="text-center text-sm text-danger" role="alert">
              {submitError}
            </p>
          ) : null}

          <AuthButton loading={loading} disabled={busy}>
            {loading ? 'Signing in…' : 'Sign in'}
          </AuthButton>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="font-medium text-primary-400 hover:text-primary-300">
            Create one
          </a>
        </p>
      </AuthCard>
    </AuthPageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthPageShell>
          <ForgeWindAuthMark />
          <AuthCard>
            <p className="text-center text-sm text-muted-foreground">Loading…</p>
          </AuthCard>
        </AuthPageShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

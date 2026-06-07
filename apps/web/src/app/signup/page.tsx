'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { registerUser } from '@/app/login/actions';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthInput } from '@/components/auth/auth-input';
import { AuthButton } from '@/components/auth/auth-button';
import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { ForgeWindAuthMark } from '@/components/auth/forgewind-auth-mark';
import { isValidEmail } from '@/lib/auth/validate';

type FieldErrors = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}>;

function SignupForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const next: FieldErrors = {};
    if (!firstName.trim()) next.firstName = 'First name is required';
    if (!lastName.trim()) next.lastName = 'Last name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!isValidEmail(email.trim())) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters';

    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const result = await registerUser(email, password, firstName, lastName, callbackUrl);
      if (!result.ok) {
        setSubmitError(result.error);
        setLoading(false);
      } else {
        window.location.href = result.redirectTo;
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <AuthPageShell>
      <ForgeWindAuthMark />
      <AuthCard>
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-primary-400">Create account</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Get started
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Or{' '}
            <a href="/login" className="font-medium text-primary-400 hover:text-primary-300">
              sign in to your account
            </a>
          </p>
        </div>

        <form noValidate onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <AuthInput
              label="First name"
              name="firstName"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={fieldErrors.firstName}
            />
            <AuthInput
              label="Last name"
              name="lastName"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={fieldErrors.lastName}
            />
          </div>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          {submitError ? (
            <p className="text-center text-sm text-danger" role="alert">
              {submitError}
            </p>
          ) : null}

          <AuthButton loading={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </AuthButton>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          By creating an account you agree to our terms and privacy policy.
        </p>
      </AuthCard>
    </AuthPageShell>
  );
}

export default function SignupPage() {
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
      <SignupForm />
    </Suspense>
  );
}

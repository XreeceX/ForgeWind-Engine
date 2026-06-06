"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loginWithCredentials } from "@/app/login/actions";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ForgeWindAuthMark } from "@/components/auth/forgewind-auth-mark";
import { isValidEmail, isValidUsername } from "@/lib/auth/validate";

type FieldErrors = Partial<{ username: string; password: string }>;

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const authError = searchParams.get("error");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authError === "CredentialsSignin") {
      setSubmitError("Invalid credentials");
    }
  }, [authError]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const trimmed = username.trim();
    const next: FieldErrors = {};
    if (!trimmed) next.username = "Email or username is required";
    else if (!isValidUsername(trimmed) && !isValidEmail(trimmed)) {
      next.username = "Enter a valid email or username";
    }
    if (!password) next.password = "Password is required";

    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const result = await loginWithCredentials(trimmed, password, callbackUrl);

      if (!result.ok) {
        setSubmitError(result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell>
      <ForgeWindAuthMark />
      <AuthCard>
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-primary-400">Sign in</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Development access only. Demo sign-in: username rod, password rod8989.
          </p>
        </div>

        <form noValidate onSubmit={onSubmit} className="space-y-5">
          <AuthInput
            label="Email or username"
            name="username"
            type="text"
            inputMode="text"
            autoComplete="username"
            spellCheck={false}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username}
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

          <AuthButton loading={loading}>{loading ? "Signing in…" : "Sign in"}</AuthButton>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Single shared development account. Credentials are distributed outside this app.
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

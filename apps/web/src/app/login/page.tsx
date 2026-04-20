"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ForgeWindAuthMark } from "@/components/auth/forgewind-auth-mark";
import { isValidUsername } from "@/lib/auth/validate";
import { safeCallbackPath } from "@/lib/auth/safe-callback-path";
import { syncDemoSessionToStore } from "@/lib/auth/sync-auth-store";
import { useAuthStore } from "@/stores/auth.store";

type FieldErrors = Partial<{ username: string; password: string }>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const login = useAuthStore((s) => s.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const next: FieldErrors = {};
    if (!username.trim()) next.username = "Username is required";
    else if (!isValidUsername(username)) next.username = "Enter a valid username";
    if (!password) next.password = "Password is required";

    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setSubmitError("Invalid credentials");
        return;
      }

      syncDemoSessionToStore(login);
      router.push(safeCallbackPath(callbackUrl, "/forgewind-engine"));
      router.refresh();
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
            Development access only. Public registration is disabled.
          </p>
        </div>

        <form noValidate onSubmit={onSubmit} className="space-y-5">
          <AuthInput
            label="Username"
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

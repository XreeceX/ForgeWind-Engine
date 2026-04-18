"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { CareerOSAuthMark } from "@/components/auth/careeros-auth-mark";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/auth/demo-user";
import { isValidEmail, meetsPasswordPolicy } from "@/lib/auth/validate";
import { safeCallbackPath } from "@/lib/auth/safe-callback-path";
import { syncDemoSessionToStore } from "@/lib/auth/sync-auth-store";
import { useAuthStore } from "@/stores/auth.store";

type FieldErrors = Partial<{ email: string; password: string }>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const callbackUrl = searchParams.get("callbackUrl");

  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const next: FieldErrors = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!isValidEmail(email)) next.email = "Enter a valid email";
    if (!password) next.password = "Password is required";
    else if (!meetsPasswordPolicy(password))
      next.password = "Password must be at least 8 characters";

    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setSubmitError("Invalid credentials");
        return;
      }

      syncDemoSessionToStore(login);
      router.push(safeCallbackPath(callbackUrl, "/dashboard"));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell>
      <CareerOSAuthMark />
      <AuthCard>
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-primary-300">Sign in</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-400">Access your CareerOS workspace.</p>
        </div>

        {registered ? (
          <p className="mb-6 rounded-xl border border-accent-500/25 bg-accent-500/10 px-3 py-2 text-center text-xs text-accent-200">
            Account created — sign in with your email and password.
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-5">
          <AuthInput
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
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

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-3 text-left text-xs text-slate-400">
            <p className="font-medium text-primary-200/90">Demo credentials</p>
            <p className="mt-2 font-mono text-[11px] leading-relaxed text-slate-400">
              <span className="text-slate-500">Email</span> {DEMO_EMAIL}
              <br />
              <span className="text-slate-500">Password</span> {DEMO_PASSWORD}
            </p>
          </div>

          <AuthButton loading={loading}>{loading ? "Signing in…" : "Sign in"}</AuthButton>
        </form>

        <div className="mt-8 space-y-3 text-center text-sm text-slate-400">
          <div>
            <Link
              href="/forgot-password"
              className="text-slate-400 underline-offset-4 transition-colors hover:text-slate-50 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <p>
            No account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary-300 underline-offset-4 transition-colors hover:text-primary-200 hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthPageShell>
          <CareerOSAuthMark />
          <AuthCard>
            <p className="text-center text-sm text-slate-400">Loading…</p>
          </AuthCard>
        </AuthPageShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

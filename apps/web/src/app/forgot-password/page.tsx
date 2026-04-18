"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ForgeWindAuthMark } from "@/components/auth/forgewind-auth-mark";
import { isValidEmail } from "@/lib/auth/validate";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSent(true);
  }

  return (
    <AuthPageShell>
      <ForgeWindAuthMark />
      <AuthCard>
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-primary-300">Reset access</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">Forgot password</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Demo only — we don&apos;t send email. Enter any address to continue the flow.
          </p>
        </div>

        {sent ? (
          <div className="space-y-6 text-center">
            <p className="rounded-xl border border-primary-500/25 bg-primary-500/10 px-3 py-3 text-sm text-slate-400">
              If this were production, we&apos;d email a reset link to{" "}
              <span className="font-mono text-xs text-primary-200">{email}</span>.
            </p>
            <Link
              href="/login"
              className="inline-block text-sm font-medium text-primary-300 underline-offset-4 hover:text-primary-200 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <AuthInput
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
            />
            <AuthButton type="submit" loading={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </AuthButton>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-slate-400">
          <Link
            href="/login"
            className="font-medium text-primary-300 underline-offset-4 transition-colors hover:text-primary-200 hover:underline"
          >
            ← Back to sign in
          </Link>
        </p>
      </AuthCard>
    </AuthPageShell>
  );
}

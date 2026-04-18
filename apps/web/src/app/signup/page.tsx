"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ForgeWindAuthMark } from "@/components/auth/forgewind-auth-mark";
import { isValidEmail, meetsPasswordPolicy } from "@/lib/auth/validate";

type FieldErrors = Partial<{
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}>;

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!isValidEmail(email)) next.email = "Enter a valid email";
    if (!password) next.password = "Password is required";
    else if (!meetsPasswordPolicy(password))
      next.password = "Password must be at least 8 characters";
    if (!confirmPassword) next.confirmPassword = "Confirm your password";
    else if (password !== confirmPassword) next.confirmPassword = "Passwords do not match";

    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 450));
    setLoading(false);

    router.push("/login?registered=1");
  }

  return (
    <AuthPageShell>
      <ForgeWindAuthMark />
      <AuthCard>
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-primary-300">Create account</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">Join ForgeWind</h1>
          <p className="mt-1.5 text-sm text-slate-400">Demo signup — no email is sent.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <AuthInput
            label="Name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
          />
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          <AuthInput
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
          />

          <AuthButton loading={loading}>{loading ? "Creating account…" : "Create account"}</AuthButton>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-300 underline-offset-4 transition-colors hover:text-primary-200 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthPageShell>
  );
}

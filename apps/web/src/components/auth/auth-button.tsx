"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

export function AuthButton({
  loading = false,
  children,
  type = "submit",
  className,
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-transparent",
        "bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-sm font-semibold text-slate-50 shadow-glow-primary",
        "transition duration-300 ease-out hover:brightness-105 active:brightness-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

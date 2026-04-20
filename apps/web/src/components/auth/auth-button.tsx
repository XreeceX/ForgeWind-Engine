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
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-fw-btn border border-transparent",
        "bg-fw-orange text-sm font-semibold text-fw-white shadow-sm",
        "transition duration-200 ease-out hover:bg-fw-deep active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fw-orange focus-visible:ring-offset-2",
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

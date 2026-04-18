"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const fieldId = id ?? props.name;

    return (
      <div className="space-y-2">
        <label
          htmlFor={fieldId}
          className="block text-xs font-medium uppercase tracking-[0.2em] text-primary-300"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          className={cn(
            "h-11 w-full rounded-xl border bg-white/[0.03] px-3.5 text-sm text-slate-50 placeholder:text-slate-500",
            "transition-colors duration-200",
            "outline-none focus:border-primary-400/50 focus:ring-1 focus:ring-primary-400/25",
            error
              ? "border-danger/55 focus:border-danger/70 focus:ring-danger/20"
              : "border-white/[0.1]",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        />
        {error ? (
          <p id={`${fieldId}-error`} className="text-xs text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

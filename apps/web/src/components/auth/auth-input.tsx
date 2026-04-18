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
          className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-500"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          className={cn(
            "h-11 w-full border border-border bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400",
            "transition-colors duration-200",
            "outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30",
            error
              ? "border-danger/55 focus:border-danger/70 focus:ring-danger/20"
              : "",
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

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      startIcon,
      endIcon,
      className,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const leftIcon = startIcon ?? icon;
    const showHint = !error && hint;

    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {leftIcon}
            </div>
          )}
          {endIcon && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              {endIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            className={cn(
              "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-white shadow-xs transition-all",
              "placeholder:text-slate-500 focus:border-primary-500/70 focus:outline-none focus:ring-2 focus:ring-primary-500/30",
              error &&
                "border-danger/50 focus:border-danger/70 focus:ring-danger/30",
              leftIcon && "pl-10",
              endIcon && "pr-10",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-300" role="alert">
            {error}
          </p>
        )}
        {showHint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

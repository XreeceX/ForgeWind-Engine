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
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          {endIcon && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {endIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            className={cn(
              "h-10 w-full rounded-xl border border-border bg-surface-light px-3 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300",
              "placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:shadow-[0_0_0_1px_rgba(249,115,22,0.35),0_0_0_4px_rgba(249,115,22,0.12)]",
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
          <p className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {showHint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

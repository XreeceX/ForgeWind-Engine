import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-gradient-to-r from-primary-700 via-primary-500 to-accent-400 text-white shadow-glow-primary hover:brightness-105 hover:shadow-lg active:brightness-95",
  secondary:
    "premium-border border-border bg-surface-light text-foreground shadow-xs hover:bg-surface-lighter",
  ghost:
    "border border-transparent text-muted-foreground hover:border-border hover:bg-surface-light hover:text-foreground",
  danger:
    "border border-danger/25 bg-danger/10 text-red-600 hover:border-danger/45 hover:bg-danger/20",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-xl px-3 text-xs",
  md: "h-10 gap-2 rounded-xl px-4 text-sm",
  lg: "h-12 gap-2.5 rounded-2xl px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </button>
  )
);

Button.displayName = "Button";

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
    "border border-transparent bg-fw-orange text-fw-white shadow-sm hover:bg-fw-deep active:scale-[0.98]",
  secondary:
    "border border-fw-gray-100 bg-fw-white text-fw-gray-700 shadow-sm hover:bg-fw-gray-50",
  ghost:
    "border border-transparent bg-transparent text-fw-gray-400 hover:text-fw-orange",
  danger:
    "border border-danger/25 bg-danger/10 text-red-600 hover:border-danger/45 hover:bg-danger/20",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-fw-btn px-3 text-xs font-medium",
  md: "h-10 gap-2 rounded-fw-btn px-5 text-sm font-medium",
  lg: "h-12 gap-2.5 rounded-fw-btn px-6 text-base font-medium",
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
        "inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fw-orange focus-visible:ring-offset-2",
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

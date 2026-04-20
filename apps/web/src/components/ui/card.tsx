import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type CardVariant = "default" | "elevated" | "interactive";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: "panel premium-border",
  elevated: "panel-elevated premium-border",
  interactive: "panel-interactive premium-border",
};

export function Card({
  children,
  className,
  variant = "default",
  hover = false,
  ...props
}: CardProps) {
  const resolvedVariant = hover ? "interactive" : variant;
  return (
    <div
      className={cn(
        variantStyles[resolvedVariant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-b border-border px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-t border-border px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold text-foreground", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

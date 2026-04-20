import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("fw-skeleton min-h-[1em] w-full", className)}
      {...props}
    />
  );
}

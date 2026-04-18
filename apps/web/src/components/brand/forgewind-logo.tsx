import Image from "next/image";
import { cn } from "@/lib/cn";

const LOGO_SRC = "/brand/logo.png";

interface ForgeWindLogoProps {
  /** Square display size in pixels */
  size?: number;
  className?: string;
  priority?: boolean;
}

export function ForgeWindLogo({ size = 40, className, priority }: ForgeWindLogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt="ForgeWind"
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}

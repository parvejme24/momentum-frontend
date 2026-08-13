import Link from "next/link";

import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cn("brand-mark", size === "lg" && "lg", className)}
      aria-hidden
    >
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export function BrandLockup({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span className={cn("brand", size === "lg" && "brand-lg", className)}>
      <BrandMark size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"} />
      Momentum
    </span>
  );
}

export function BrandLink({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Link href="/" className={cn("cursor-pointer", className)} aria-label="Momentum home">
      <BrandLockup size={size} />
    </Link>
  );
}

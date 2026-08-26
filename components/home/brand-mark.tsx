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
      className={cn(
        "grid size-[30px] shrink-0 grid-cols-2 gap-0.5 rounded-[6px] border border-[var(--stroke)] bg-blue p-1",
        size === "lg" && "size-[38px]",
        className,
      )}
      aria-hidden
    >
      <i className="block rounded-px bg-white/35 first:bg-white last:bg-white" />
      <i className="block rounded-px bg-white/35 first:bg-white last:bg-white" />
      <i className="block rounded-px bg-white/35 first:bg-white last:bg-white" />
      <i className="block rounded-px bg-white/35 first:bg-white last:bg-white" />
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
    <span
      className={cn(
        "flex items-center gap-2.5 font-heading text-[1.3rem] font-extrabold tracking-[-0.04em]",
        size === "lg" && "text-[clamp(1.35rem,2.4vw,1.75rem)]",
        className,
      )}
    >
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

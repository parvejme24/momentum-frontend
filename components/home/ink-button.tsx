import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttons } from "@/lib/ui";

type InkButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "flame";
  className?: string;
  size?: "md" | "lg" | "sm";
};

export function InkButton({
  href,
  children,
  variant = "primary",
  className,
  size = "md",
}: InkButtonProps) {
  return (
    <Link href={href} className={cn(buttons(variant, size), className)}>
      {children}
    </Link>
  );
}

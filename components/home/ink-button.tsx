import Link from "next/link";

import { cn } from "@/lib/utils";

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
    <Link
      href={href}
      className={cn(
        "btn",
        variant === "primary" && "btn-primary",
        variant === "flame" && "btn-flame",
        variant === "ghost" && "btn-ghost",
        size === "lg" && "btn-lg",
        size === "sm" && "btn-sm",
        className,
      )}
    >
      {children}
    </Link>
  );
}

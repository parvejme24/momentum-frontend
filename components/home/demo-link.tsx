"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const DEMO_HASH = "#demo";

export function scrollToDemo(smooth = true) {
  const target = document.getElementById("demo");
  if (!target) return false;

  target.scrollIntoView({
    behavior:
      smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "smooth"
        : "auto",
    block: "start",
  });
  return true;
}

type DemoLinkProps = {
  children: React.ReactNode;
  className?: string;
};

export function DemoLink({ children, className }: DemoLinkProps) {
  const pathname = usePathname();

  function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;

    event.preventDefault();
    if (scrollToDemo()) {
      window.history.replaceState(null, "", DEMO_HASH);
    }
  }

  return (
    <Link href={`/${DEMO_HASH}`} onClick={onClick} className={cn(className)}>
      {children}
    </Link>
  );
}

export function DemoScrollOnLoad() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/" || window.location.hash !== DEMO_HASH) return;

    const timer = window.setTimeout(() => {
      if (scrollToDemo()) {
        window.history.replaceState(null, "", DEMO_HASH);
      }
    }, 50);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}

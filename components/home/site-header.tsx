"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { AccountMenu } from "@/components/home/account-menu";
import { BrandLink } from "@/components/home/brand-mark";
import { InkButton } from "@/components/home/ink-button";
import { easeOut } from "@/components/home/motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";
import { btnBlock, btnIcon, wrap } from "@/lib/ui";

const NAV = [
  { href: "/", label: "Home", index: "01" },
  { href: "/pricing", label: "Pricing", index: "02" },
  { href: "/faq", label: "FAQ", index: "03" },
] as const;

function isHeaderActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const navLink =
  "relative cursor-pointer py-1 text-[0.92rem] font-semibold text-ink-70 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-flame after:transition-[width] after:duration-normal after:ease-smooth hover:text-ink hover:after:w-full aria-[current=page]:text-blue aria-[current=page]:after:w-full aria-[current=page]:after:bg-blue";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { user, isLoading } = useAuth();
  const signedIn = Boolean(user);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--stroke)] bg-topbar backdrop-blur-[10px] dark:backdrop-blur-[14px]">
      <div className={cn(wrap, "flex h-[70px] items-center justify-between gap-5")}>
        <BrandLink size="lg" />

        <nav className="hidden items-center gap-[26px] nav:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = isHeaderActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={navLink}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <div className="hidden items-center gap-2 nav:flex">
            {isLoading || signedIn ? null : (
              <>
                <InkButton href="/login" variant="ghost" size="sm">
                  Sign in
                </InkButton>
                <InkButton href="/register" size="sm">
                  Start free
                </InkButton>
              </>
            )}
          </div>
          {signedIn ? <AccountMenu /> : null}

          <button
            type="button"
            className={cn(btnIcon, "inline-flex nav:hidden")}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-nav-root"
            className="fixed inset-0 top-[70px] z-60"
            id="mobile-nav"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18, ease: easeOut }}
          >
            <button
              type="button"
              className="absolute inset-0 cursor-pointer border-0 bg-backdrop p-0"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="relative z-1 w-full border-b border-[var(--stroke)] bg-paper bg-[size:24px_24px] bg-[position:-1px_-1px] bg-[image:linear-gradient(var(--grid)_1px,transparent_1px),linear-gradient(90deg,var(--grid)_1px,transparent_1px)] px-4 pt-4 pb-5 shadow-paper"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={reduce ? false : { y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: -8, opacity: 0 }}
              transition={{ duration: 0.22, ease: easeOut }}
            >
              <nav className="grid gap-2" aria-label="Mobile">
                {NAV.map((item, i) => {
                  const active = isHeaderActive(pathname, item.href);
                  return (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border border-[var(--stroke)] bg-paper-white px-3.5 py-3.5 shadow-paper-sm transition-[transform,box-shadow] duration-fast ease-smooth hover:-translate-y-0.5 hover:shadow-hover focus-visible:-translate-y-0.5 focus-visible:shadow-hover",
                        active &&
                          "border-[color-mix(in_srgb,var(--blue)_45%,transparent)] shadow-[var(--focus-ring)]",
                      )}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.24,
                        ease: easeOut,
                        delay: reduce ? 0 : 0.04 + i * 0.04,
                      }}
                    >
                      <span className="min-w-6 font-mono text-[0.72rem] font-bold tracking-[0.08em] text-flame">
                        {item.index}
                      </span>
                      <span
                        className={cn(
                          "font-heading text-[1.05rem] font-extrabold tracking-[-0.03em] text-ink",
                          active && "text-blue",
                        )}
                      >
                        {item.label}
                      </span>
                    </motion.a>
                  );
                })}
              </nav>

              {signedIn ? null : (
                <div className="mt-3.5 grid gap-2.5 border-t border-[var(--divider)] pt-3.5">
                  <InkButton href="/login" variant="ghost" className={btnBlock}>
                    Sign in
                  </InkButton>
                  <InkButton href="/register" className={btnBlock}>
                    Start free
                  </InkButton>
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

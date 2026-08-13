"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { BrandLink } from "@/components/home/brand-mark";
import { InkButton } from "@/components/home/ink-button";
import { easeOut } from "@/components/home/motion";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/#how", label: "How it works", index: "01" },
  { href: "/pricing", label: "Pricing", index: "02" },
  { href: "/faq", label: "FAQ", index: "03" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

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
    <header className="topbar">
      <div className="wrap">
        <BrandLink size="lg" />

        <nav className="topnav" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="topbar-actions">
          <ThemeToggle />
          <div className="topbar-cta">
            <InkButton href="/login" variant="ghost" size="sm">
              Sign in
            </InkButton>
            <InkButton href="/register" size="sm">
              Start free
            </InkButton>
          </div>

          <button
            type="button"
            className="btn-icon topbar-menu"
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
            className="mobile-nav"
            id="mobile-nav"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18, ease: easeOut }}
          >
            <button
              type="button"
              className="mobile-nav-backdrop"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="mobile-nav-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={reduce ? false : { y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: -8, opacity: 0 }}
              transition={{ duration: 0.22, ease: easeOut }}
            >
              <nav className="mobile-nav-list" aria-label="Mobile">
                {NAV.map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    className="mobile-nav-link"
                    onClick={() => setOpen(false)}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.24,
                      ease: easeOut,
                      delay: reduce ? 0 : 0.04 + i * 0.04,
                    }}
                  >
                    <span className="mobile-nav-index mono">{item.index}</span>
                    <span className="mobile-nav-label">{item.label}</span>
                  </motion.a>
                ))}
              </nav>

              <div className="mobile-nav-actions">
                <InkButton href="/login" variant="ghost" className="btn-block">
                  Sign in
                </InkButton>
                <InkButton href="/register" className="btn-block">
                  Start free
                </InkButton>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

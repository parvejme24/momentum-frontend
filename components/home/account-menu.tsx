"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  LogOut,
} from "lucide-react";

import { easeOut } from "@/components/home/motion";
import { buildAccountMenuLinks } from "@/lib/app/navigation";
import { useAuth } from "@/lib/auth/context";
import { isAdmin } from "@/lib/auth/role";

type MenuLink = {
  href: string;
  label: string;
  icon: ReturnType<typeof buildAccountMenuLinks>[number]["icon"];
};

function initialFromName(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function AccountMenu() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const admin = isAdmin(user);
  const name = user?.name?.trim() || "Account";
  const email = user?.email?.trim() || "";
  const initial = initialFromName(name);

  const links: MenuLink[] = buildAccountMenuLinks(admin);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function onSignOut() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  }

  if (!user) return null;

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        type="button"
        className="btn-icon account-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Account menu"
        onClick={() => setOpen((value) => !value)}
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="avatar" src={user.avatarUrl} alt="" />
        ) : (
          <span className="avatar" aria-hidden>
            {initial}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            role="menu"
            aria-label="Account"
            className="account-menu-panel"
            initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: easeOut }}
          >
            <div className="account-menu-who">
              <div className="account-menu-name">{name}</div>
              {email ? (
                <div className="account-menu-email mono">{email}</div>
              ) : null}
            </div>

            {links.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className="account-menu-link"
                  onClick={() => setOpen(false)}
                >
                  <Icon size={16} strokeWidth={2.2} aria-hidden />
                  {item.label}
                </Link>
              );
            })}

            <button
              type="button"
              role="menuitem"
              className="account-menu-link account-menu-signout"
              onClick={() => void onSignOut()}
              disabled={signingOut}
            >
              <LogOut size={16} strokeWidth={2.2} aria-hidden />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

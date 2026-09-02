"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  LogOut,
} from "lucide-react";

import { easeOut } from "@/components/home/motion";
import { buildAccountMenuLinks } from "@/lib/app/navigation";
import { navPrefetchHandlers } from "@/lib/app/prefetch";
import { useAuth } from "@/lib/auth/context";
import { isAdmin } from "@/lib/auth/role";
import { cn } from "@/lib/utils";
import { avatar, btnIcon, mono } from "@/lib/ui";

type MenuLink = {
  href: string;
  label: string;
  icon: ReturnType<typeof buildAccountMenuLinks>[number]["icon"];
};

function initialFromName(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

const menuLink =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-[calc(var(--radius)-2px)] border-0 bg-transparent px-2.5 py-[9px] text-left font-sans text-[0.9rem] font-semibold text-ink hover:bg-blue-soft focus-visible:bg-blue-soft focus-visible:outline-none";

export function AccountMenu() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const queryClient = useQueryClient();
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
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className={cn(
          btnIcon,
          "overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Account menu"
        onClick={() => setOpen((value) => !value)}
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="size-full rounded-[inherit] border-0 object-cover"
            src={user.avatarUrl}
            alt=""
          />
        ) : (
          <span
            className={cn(
              avatar,
              "size-full rounded-[inherit] border-0 text-base dark:border-[rgba(212,165,116,0.35)] dark:bg-[linear-gradient(145deg,var(--flame),#b8895a)] dark:text-[#0f1117]",
            )}
            aria-hidden
          >
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
            className="absolute top-[calc(100%+10px)] right-0 z-70 min-w-[228px] rounded-md border border-[var(--stroke)] bg-paper-white p-2 shadow-paper-sm"
            initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.36, ease: easeOut }}
          >
            <div className="mx-0.5 mb-1.5 border-b border-[var(--divider)] px-2.5 pt-2 pb-3">
              <div className="font-bold tracking-[-0.01em]">{name}</div>
              {email ? (
                <div className={cn(mono, "mt-0.5 truncate text-[0.72rem] text-ink-50")}>
                  {email}
                </div>
              ) : null}
            </div>

            {links.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className={menuLink}
                  onClick={() => setOpen(false)}
                  {...navPrefetchHandlers(queryClient, item.href)}
                >
                  <Icon size={16} strokeWidth={2.2} aria-hidden />
                  {item.label}
                </Link>
              );
            })}

            <button
              type="button"
              role="menuitem"
              className={cn(
                menuLink,
                "mt-1 text-ink-70 hover:bg-flame-soft focus-visible:bg-flame-soft",
              )}
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

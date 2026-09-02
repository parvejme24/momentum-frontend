"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { AiChatWidget } from "@/components/ai/ai-chat-widget";
import { BrandLockup } from "@/components/home/brand-mark";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppShellSkeleton } from "@/components/ui/page-skeletons";
import {
  ADMIN_TAB_NAV,
  buildSideNavSections,
  CUSTOMER_TAB_NAV,
  isNavActive,
} from "@/lib/app/navigation";
import { navPrefetchHandlers } from "@/lib/app/prefetch";
import { customer } from "@/lib/data/customer";
import { useAuth } from "@/lib/auth/context";
import { loginRedirectPath } from "@/lib/auth/protected-routes";
import { isAdmin } from "@/lib/auth/role";
import {
  avatar,
  btn,
  btnBlock,
  btnGhost,
  btnPrimary,
  btnSm,
  mono,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

const NAV_LINK =
  "flex min-h-[42px] cursor-pointer items-center gap-3 rounded-lg border-2 border-transparent bg-transparent px-3.5 py-2.5 text-[0.92rem] font-semibold text-ink-70 shadow-none transition-[transform,box-shadow,background,border-color,color,opacity] duration-normal ease-smooth hover:translate-x-[3px] hover:bg-[color-mix(in_srgb,var(--paper-white)_88%,var(--blue-soft))] hover:text-ink focus-visible:text-blue focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none dark:hover:bg-[color-mix(in_srgb,var(--paper-white)_75%,var(--blue-soft))] [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:stroke-current";

const NAV_LINK_CURRENT =
  "bg-[linear-gradient(120deg,color-mix(in_srgb,var(--blue-soft)_80%,transparent),color-mix(in_srgb,var(--flame-soft)_35%,transparent))] text-blue-deep shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--blue)_32%,transparent)] hover:translate-x-0 hover:bg-[linear-gradient(120deg,color-mix(in_srgb,var(--blue-soft)_90%,transparent),color-mix(in_srgb,var(--flame-soft)_40%,transparent))] hover:text-blue-deep dark:bg-[linear-gradient(120deg,color-mix(in_srgb,var(--blue-soft)_90%,transparent),color-mix(in_srgb,var(--flame-soft)_50%,transparent))] dark:shadow-[inset_0_0_0_1px_rgba(139,164,201,0.35)]";

const TAB_LINK =
  "grid min-h-[54px] cursor-pointer content-center justify-items-center gap-1 rounded-lg border-2 border-transparent bg-transparent px-1 py-2 text-[0.62rem] font-bold tracking-[0.02em] text-ink-50 transition-[background,border-color,color,transform] duration-normal ease-smooth focus-visible:text-blue focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none [&_svg]:size-5 [&_svg]:stroke-current";

const TAB_LINK_CURRENT =
  "bg-[linear-gradient(160deg,color-mix(in_srgb,var(--blue-soft)_85%,transparent),color-mix(in_srgb,var(--flame-soft)_40%,transparent))] text-blue-deep shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--blue)_32%,transparent)] dark:shadow-[inset_0_0_0_1px_rgba(139,164,201,0.35)]";

function isModifiedClick(event: React.MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function initialFromName(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const admin = isAdmin(user);
  const name = user?.name?.trim() || customer.profile.name;
  const timezone = user?.timezone || customer.profile.timezone;

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useLayoutEffect(() => {
    if (isLoading || user) return;
    window.location.replace(loginRedirectPath(pathname || "/dashboard"));
  }, [isLoading, user, pathname]);

  const currentPath = pendingHref ?? pathname;
  const sideNavSections = buildSideNavSections(admin);
  const tabNav = admin ? ADMIN_TAB_NAV : CUSTOMER_TAB_NAV;

  function markPending(href: string) {
    return (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (isModifiedClick(event)) return;
      setPendingHref(href);
    };
  }

  async function onSignOut() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  }

  if (isLoading) {
    return <AppShellSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="grid min-h-screen grid-cols-1 nav:grid-cols-[250px_1fr]">
      <aside
        className="sticky top-0 hidden h-screen flex-col gap-4 overflow-hidden border-r border-[var(--stroke)] bg-[linear-gradient(165deg,color-mix(in_srgb,var(--blue-soft)_55%,var(--paper-raised))_0%,var(--paper-raised)_42%,color-mix(in_srgb,var(--flame-soft)_28%,var(--paper-raised))_100%)] px-4 py-8 backdrop-blur-[8px] nav:flex dark:border-[rgba(221,216,207,0.08)] dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--paper-raised)_95%,var(--blue-soft))_0%,var(--paper)_45%,color-mix(in_srgb,var(--paper)_92%,var(--flame-soft))_100%)] dark:backdrop-blur-[12px]"
        aria-label="App"
      >
        <Link href="/dashboard" aria-label="Momentum today">
          <BrandLockup />
        </Link>

        <nav
          className="mt-6 flex min-h-0 flex-1 flex-col gap-0 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Primary"
        >
          {sideNavSections.map((section, sectionIndex) => (
            <div
              key={section.label ?? `section-${sectionIndex}`}
              className={cn(
                "grid gap-2",
                sectionIndex > 0 && "mt-6",
                section.label &&
                  sectionIndex > 0 &&
                  "border-t border-ink/8 pt-6 dark:border-[rgba(221,216,207,0.08)]",
              )}
            >
              {section.label ? (
                <p
                  className={cn(
                    mono,
                    "m-0 mb-2 px-3.5 text-[0.68rem] tracking-[0.12em] uppercase text-ink-50",
                  )}
                >
                  {section.label}
                </p>
              ) : null}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(currentPath, item.href, "side");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(NAV_LINK, active && NAV_LINK_CURRENT)}
                    aria-current={active ? "page" : undefined}
                    onClick={markPending(item.href)}
                    {...navPrefetchHandlers(queryClient, item.href)}
                  >
                    <Icon strokeWidth={2.2} aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="mt-4 shrink-0">
          <Link href="/habits/new" className={cn(btn, btnPrimary, btnBlock, btnSm)}>
            <Plus size={16} strokeWidth={2.4} aria-hidden />
            New habit
          </Link>
        </div>

        <div className="mt-auto shrink-0 border-t border-ink/8 pt-6 dark:border-[rgba(221,216,207,0.08)]">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                avatar,
                "overflow-hidden dark:border-[rgba(212,165,116,0.35)] dark:bg-linear-to-br dark:from-flame dark:to-[#b8895a] dark:text-[#0f1117]",
              )}
              aria-hidden
            >
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                initialFromName(name)
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[0.92rem] font-bold tracking-[-0.01em]">
                {name}
              </div>
              <div className={cn(mono, "mt-0.5 truncate text-[0.68rem] text-ink-50")}>
                {admin ? "Admin · " : ""}
                {timezone}
              </div>
            </div>
            <ThemeToggle className="ml-auto size-9" />
            <NotificationBell className="size-9" />
          </div>
          <button
            type="button"
            className={cn(btn, btnGhost, btnSm, btnBlock, "mt-4")}
            onClick={() => void onSignOut()}
            disabled={signingOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="min-w-0 px-page pt-8 pb-24 max-nav:px-4 max-nav:pt-6 max-nav:pb-28">
        <div className="-mt-1 mb-3.5 hidden justify-end gap-2 max-nav:flex">
          <NotificationBell />
          <ThemeToggle />
        </div>
        <div key={pathname} className="animate-stage-in motion-reduce:animate-none">
          {children}
        </div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 hidden border-t border-[var(--stroke)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--paper-raised)_88%,transparent),var(--paper-raised))] px-2.5 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] backdrop-blur-[10px] max-nav:block dark:border-[rgba(221,216,207,0.08)] dark:bg-[color-mix(in_srgb,var(--paper-raised)_94%,transparent)] dark:backdrop-blur-[14px]"
        aria-label="Mobile"
      >
        <ul className="m-0 grid list-none grid-cols-5 gap-1.5 p-0">
          {tabNav.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(currentPath, item.href, "tab");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(TAB_LINK, active && TAB_LINK_CURRENT)}
                  aria-current={active ? "page" : undefined}
                  onClick={markPending(item.href)}
                  {...navPrefetchHandlers(queryClient, item.href)}
                >
                  <Icon strokeWidth={2.2} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <AiChatWidget />
    </div>
  );
}

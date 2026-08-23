"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

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
import { customer } from "@/lib/data/customer";
import { useAuth } from "@/lib/auth/context";
import { loginRedirectPath } from "@/lib/auth/protected-routes";
import { isAdmin } from "@/lib/auth/role";

function isModifiedClick(event: React.MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function initialFromName(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
    <div className="app">
      <aside className="sidebar" aria-label="App">
        <Link href="/dashboard" aria-label="Momentum today">
          <BrandLockup />
        </Link>

        <nav className="nav" aria-label="Primary">
          {sideNavSections.map((section, sectionIndex) => (
            <div
              key={section.label ?? `section-${sectionIndex}`}
              className={section.label ? "nav-section" : undefined}
            >
              {section.label ? (
                <p className="nav-section-label mono">{section.label}</p>
              ) : null}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(currentPath, item.href, "side");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={active ? "is-current" : undefined}
                    aria-current={active ? "page" : undefined}
                    onClick={markPending(item.href)}
                  >
                    <Icon strokeWidth={2.2} aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 18 }}>
          <Link href="/habits/new" className="btn btn-primary btn-block btn-sm">
            <Plus size={16} strokeWidth={2.4} aria-hidden />
            New habit
          </Link>
        </div>

        <div className="side-foot">
          <div className="who">
            <div className="avatar" aria-hidden>
              {initialFromName(name)}
            </div>
            <div className="who-meta">
              <div className="who-name">{name}</div>
              <div className="who-tz mono">
                {admin ? "Admin · " : ""}
                {timezone}
              </div>
            </div>
            <ThemeToggle className="side-theme" />
            <NotificationBell />
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-block"
            style={{ marginTop: 10 }}
            onClick={() => void onSignOut()}
            disabled={signingOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="app-mobile-bar">
          <NotificationBell />
          <ThemeToggle />
        </div>
        {children}
      </div>

      <nav className="tabbar" aria-label="Mobile">
        <ul>
          {tabNav.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(currentPath, item.href, "tab");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={active ? "is-current" : undefined}
                  aria-current={active ? "page" : undefined}
                  onClick={markPending(item.href)}
                >
                  <Icon strokeWidth={2.2} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

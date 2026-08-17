"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Archive,
  BarChart3,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  Plus,
  Settings,
  Users,
  UserRound,
} from "lucide-react";

import { BrandLockup } from "@/components/home/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { customer } from "@/lib/data/customer";
import { useAuth } from "@/lib/auth/context";
import { isAdmin } from "@/lib/auth/role";

type NavItem = {
  href: string;
  label: string;
  icon: typeof CalendarDays;
};

const CUSTOMER_SIDE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: CalendarDays },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/habits/archived", label: "Archive", icon: Archive },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

const ADMIN_SIDE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

const CUSTOMER_TAB_NAV: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: CalendarDays },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/habits/new", label: "New", icon: Plus },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "You", icon: UserRound },
];

const ADMIN_TAB_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "You", icon: UserRound },
];

function isActive(pathname: string, href: string, mode: "side" | "tab" = "side") {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/habits/new") return pathname.startsWith("/habits/new");
  if (href === "/habits/archived") {
    return pathname === "/habits/archived" || pathname.startsWith("/habits/archived/");
  }
  if (href === "/habits") {
    if (pathname.startsWith("/habits/archived") || pathname.startsWith("/habits/new")) {
      return false;
    }
    if (mode === "tab") {
      return pathname === "/habits" || pathname.startsWith("/habits/");
    }
    return pathname === "/habits" || pathname.startsWith("/habits/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isModifiedClick(event: React.MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function initialFromName(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const admin = isAdmin(user);
  const name = user?.name?.trim() || customer.profile.name;
  const timezone = user?.timezone || customer.profile.timezone;

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    if (isLoading || user) return;
    const next =
      pathname && pathname !== "/dashboard"
        ? `?next=${encodeURIComponent(pathname)}`
        : "";
    router.replace(`/login${next}`);
  }, [isLoading, user, pathname, router]);

  const currentPath = pendingHref ?? pathname;
  const sideNav = admin ? ADMIN_SIDE_NAV : CUSTOMER_SIDE_NAV;
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

  if (isLoading || !user) {
    return (
      <div className="app">
        <div className="main">
          <div className="page-head">
            <p className="hint">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar" aria-label="App">
        <Link
          href="/dashboard"
          aria-label={admin ? "Momentum dashboard" : "Momentum today"}
        >
          <BrandLockup />
        </Link>

        <nav className="nav" aria-label="Primary">
          {sideNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(currentPath, item.href, "side");
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
        </nav>

        {!admin ? (
          <div style={{ marginTop: 18 }}>
            <Link href="/habits/new" className="btn btn-primary btn-block btn-sm">
              <Plus size={16} strokeWidth={2.4} aria-hidden />
              New habit
            </Link>
          </div>
        ) : null}

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
          <ThemeToggle />
        </div>
        {children}
      </div>

      <nav className="tabbar" aria-label="Mobile">
        <ul>
          {tabNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(currentPath, item.href, "tab");
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

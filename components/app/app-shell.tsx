"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ListChecks,
  Plus,
  Settings,
  UserRound,
} from "lucide-react";

import { BrandLockup } from "@/components/home/brand-mark";
import { useAuth } from "@/lib/auth/context";

const SIDE_NAV = [
  { href: "/dashboard", label: "Today", icon: CalendarDays },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

const TAB_NAV = [
  { href: "/dashboard", label: "Today", icon: CalendarDays },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/habits/new", label: "New", icon: Plus },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "You", icon: UserRound },
] as const;

function isActive(pathname: string, href: string, mode: "side" | "tab" = "side") {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/habits/new") return pathname.startsWith("/habits/new");
  if (href === "/habits") {
    if (mode === "tab") return pathname === "/habits";
    return pathname === "/habits" || pathname.startsWith("/habits/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initialFromName(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const name = user?.name?.trim() || "You";
  const timezone =
    user?.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "UTC";

  return (
    <div className="app">
      <aside className="sidebar" aria-label="App">
        <Link href="/dashboard" aria-label="Momentum today">
          <BrandLockup />
        </Link>

        <nav className="nav" aria-label="Primary">
          {SIDE_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href, "side");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "active" : undefined}
                aria-current={active ? "page" : undefined}
              >
                <Icon strokeWidth={2.2} aria-hidden />
                {item.label}
              </Link>
            );
          })}
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
              <div className="who-tz mono">{timezone}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main">{children}</div>

      <nav className="tabbar" aria-label="Mobile">
        <ul>
          {TAB_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href, "tab");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={active ? "active" : undefined}
                  aria-current={active ? "page" : undefined}
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

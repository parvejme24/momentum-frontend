import type { LucideIcon } from "lucide-react";
import {
  Archive,
  BarChart3,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  Plus,
  Receipt,
  Settings,
  Sparkles,
  Users,
  UserRound,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavSection = {
  label?: string;
  items: NavItem[];
};

export const PERSONAL_SIDE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: CalendarDays },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/habits/archived", label: "Archive", icon: Archive },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
];

export const ADMIN_SIDE_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/payments", label: "Payments", icon: Receipt },
  { href: "/plans", label: "Plans", icon: Sparkles },
];

export const SETTINGS_NAV_ITEM: NavItem = {
  href: "/settings",
  label: "Settings",
  icon: Settings,
};

export const CUSTOMER_SIDE_NAV: NavItem[] = [
  ...PERSONAL_SIDE_NAV,
  SETTINGS_NAV_ITEM,
];

export const CUSTOMER_TAB_NAV: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: CalendarDays },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/habits/new", label: "New", icon: Plus },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "You", icon: UserRound },
];

export const ADMIN_TAB_NAV: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: CalendarDays },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
  { href: "/habits/new", label: "New", icon: Plus },
  { href: "/settings", label: "You", icon: UserRound },
];

export function buildSideNavSections(admin: boolean): NavSection[] {
  if (!admin) {
    return [{ items: CUSTOMER_SIDE_NAV }];
  }

  return [
    { label: "My habits", items: PERSONAL_SIDE_NAV },
    { label: "Admin", items: ADMIN_SIDE_NAV },
    { items: [SETTINGS_NAV_ITEM] },
  ];
}

export function buildAccountMenuLinks(admin: boolean): NavItem[] {
  if (!admin) {
    return [
      { href: "/dashboard", label: "Today", icon: LayoutDashboard },
      { href: "/habits", label: "Habits", icon: ListChecks },
      { href: "/stats", label: "Stats", icon: BarChart3 },
      SETTINGS_NAV_ITEM,
    ];
  }

  return [
    { href: "/dashboard", label: "Today", icon: CalendarDays },
    { href: "/habits", label: "Habits", icon: ListChecks },
    { href: "/stats", label: "Stats", icon: BarChart3 },
    { href: "/subscription", label: "Subscription", icon: CreditCard },
    { href: "/admin", label: "Admin overview", icon: LayoutDashboard },
    { href: "/users", label: "Users", icon: Users },
    SETTINGS_NAV_ITEM,
  ];
}

export function isNavActive(
  pathname: string,
  href: string,
  mode: "side" | "tab" = "side",
): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/admin") return pathname === "/admin" || pathname.startsWith("/admin/");
  if (href === "/habits/new") return pathname.startsWith("/habits/new");
  if (href === "/habits/archived") {
    return (
      pathname === "/habits/archived" ||
      pathname.startsWith("/habits/archived/")
    );
  }
  if (href === "/habits") {
    if (
      pathname.startsWith("/habits/archived") ||
      pathname.startsWith("/habits/new")
    ) {
      return false;
    }
    if (mode === "tab") {
      return pathname === "/habits" || pathname.startsWith("/habits/");
    }
    return pathname === "/habits" || pathname.startsWith("/habits/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

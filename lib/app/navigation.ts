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
  Bot,
  Users,
  UserRound,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type TabNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavItem[];
  childrenLabel?: string;
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
  { href: "/ai-prompts", label: "AI prompts", icon: Bot },
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

export const CUSTOMER_TAB_NAV: TabNavItem[] = [
  { id: "today", href: "/dashboard", label: "Today", icon: CalendarDays },
  { id: "habits", href: "/habits", label: "Habits", icon: ListChecks },
  { id: "new", href: "/habits/new", label: "New", icon: Plus },
  { id: "stats", href: "/stats", label: "Stats", icon: BarChart3 },
  { id: "you", href: "/settings", label: "You", icon: UserRound },
];

const ADMIN_PERSONAL_TAB_CHILDREN: NavItem[] = [
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/habits/archived", label: "Archive", icon: Archive },
  { href: "/habits/new", label: "New habit", icon: Plus },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
];

export const ADMIN_TAB_NAV: TabNavItem[] = [
  { id: "today", href: "/dashboard", label: "Today", icon: CalendarDays },
  {
    id: "habits",
    label: "Habits",
    icon: ListChecks,
    childrenLabel: "My habits",
    children: ADMIN_PERSONAL_TAB_CHILDREN,
  },
  {
    id: "admin",
    label: "Admin",
    icon: LayoutDashboard,
    childrenLabel: "Admin",
    children: ADMIN_SIDE_NAV,
  },
  { id: "new", href: "/habits/new", label: "New", icon: Plus },
  { id: "you", href: "/settings", label: "You", icon: UserRound },
];

export function isTabNavActive(pathname: string, item: TabNavItem): boolean {
  if (item.children?.length) {
    return item.children.some((child) => {
      if (child.href === "/habits/new") return false;
      return isNavActive(pathname, child.href, "tab");
    });
  }
  if (!item.href) return false;
  return isNavActive(pathname, item.href, "tab");
}

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

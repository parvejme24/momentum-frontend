"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { useUnreadNotificationCount } from "@/lib/notifications/hooks";
import { mono } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function NotificationBell({ className }: { className?: string }) {
  const unreadQuery = useUnreadNotificationCount();
  const count = unreadQuery.data ?? 0;

  return (
    <Link
      href="/notifications"
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-md border border-[var(--stroke)] bg-paper-white text-ink",
        "dark:border-[rgba(221,216,207,0.1)] dark:bg-[color-mix(in_srgb,var(--paper-white)_80%,transparent)]",
        "dark:hover:border-[rgba(139,164,201,0.35)] dark:hover:bg-paper-white",
        className,
      )}
      aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
    >
      <Bell size={18} strokeWidth={2.2} aria-hidden />
      {count > 0 ? (
        <span
          className={cn(
            mono,
            "absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-flame px-1 text-[0.62rem] font-bold text-white",
          )}
        >
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { useUnreadNotificationCount } from "@/lib/notifications/hooks";

export function NotificationBell() {
  const unreadQuery = useUnreadNotificationCount();
  const count = unreadQuery.data ?? 0;

  return (
    <Link
      href="/notifications"
      className="notice-bell"
      aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
    >
      <Bell size={18} strokeWidth={2.2} aria-hidden />
      {count > 0 ? (
        <span className="notice-badge mono">{count > 9 ? "9+" : count}</span>
      ) : null}
    </Link>
  );
}

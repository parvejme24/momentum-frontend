"use client";

import { useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { AdminListPageSkeleton } from "@/components/ui/page-skeletons";
import { Pager } from "@/components/ui/pager";
import { QueryError } from "@/components/ui/query-error";
import { useToast } from "@/components/auth/toast";
import { mutationErrorMessage } from "@/lib/admin/map";
import { formatDateTime } from "@/lib/dates";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/lib/notifications/hooks";
import {
  btn,
  btnGhost,
  btnIcon,
  btnSm,
  card,
  eyebrow,
  hint,
  lede,
  mono,
  pageHead,
  rowBetween,
  tabBar,
  tabs,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

export function NotificationsPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const listQuery = useNotifications({
    page,
    limit: 20,
    unread: unreadOnly ? "true" : undefined,
  });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const remove = useDeleteNotification();
  const rows = listQuery.data?.notifications ?? [];

  async function read(id: string) {
    try {
      await markRead.mutateAsync(id);
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not mark as read"));
    }
  }

  async function readAll() {
    try {
      await markAll.mutateAsync();
      pushToast("Inbox cleared");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not mark all as read"));
    }
  }

  async function trash(id: string) {
    try {
      await remove.mutateAsync(id);
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not delete"));
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="min-w-0"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        {listQuery.isLoading ? (
          <AdminListPageSkeleton rows={8} tabs={2} withSearch={false} withAction />
        ) : (
          <>
            <motion.header
              className={cn(pageHead, rowBetween)}
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div>
                <p className={cn(eyebrow, "mb-2")}>
                  {listQuery.data?.unreadCount ?? 0} unread
                </p>
                <h1>Notifications</h1>
                <p className={cn(lede, "mt-2.5 max-w-[46ch]")}>
                  Payments, account changes, and plan events — in one quiet list.
                </p>
              </div>
              <button
                type="button"
                className={cn(btn, btnGhost, btnSm)}
                disabled={markAll.isPending || (listQuery.data?.unreadCount ?? 0) === 0}
                onClick={() => void readAll()}
              >
                <CheckCheck size={16} strokeWidth={2.2} aria-hidden />
                Mark all read
              </button>
            </motion.header>

            <QueryError error={listQuery.error} />

            <motion.div
              className="mb-[18px] flex flex-wrap items-end justify-between gap-4"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className={tabBar} role="tablist" aria-label="Notification filters">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!unreadOnly}
                  className={tabs(!unreadOnly)}
                  onClick={() => {
                    setUnreadOnly(false);
                    setPage(1);
                  }}
                >
                  All
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={unreadOnly}
                  className={tabs(unreadOnly)}
                  onClick={() => {
                    setUnreadOnly(true);
                    setPage(1);
                  }}
                >
                  Unread
                </button>
              </div>
            </motion.div>

            <motion.section className={card} variants={reduce ? undefined : fadeUpSoft}>
              {rows.length === 0 ? (
                <p className={hint}>Nothing in this inbox.</p>
              ) : (
                <ul className="m-0 list-none p-0">
                  {rows.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 border-b border-ink/8 py-3.5 last:border-b-0 last:pb-0 dark:border-[rgba(221,216,207,0.08)]"
                    >
                      <div
                        className="grid size-9 shrink-0 place-items-center rounded-md border border-[var(--stroke)] bg-paper dark:bg-paper-white"
                        aria-hidden
                      >
                        <Bell size={16} strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "font-bold tracking-[-0.01em]",
                            !item.readAt && "text-ink",
                          )}
                        >
                          {item.title}
                        </div>
                        <p className={cn(hint, "mt-1")}>{item.body}</p>
                        <div className={cn(mono, "mt-0.5 text-[0.72rem] text-ink-50")}>
                          {formatDateTime(item.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {item.readAt ? null : (
                          <button
                            type="button"
                            className={cn(btn, btnGhost, btnSm)}
                            onClick={() => void read(item.id)}
                          >
                            Read
                          </button>
                        )}
                        <button
                          type="button"
                          className={cn(btnIcon, "size-9")}
                          aria-label="Delete notification"
                          onClick={() => void trash(item.id)}
                        >
                          <Trash2 size={16} strokeWidth={2.2} aria-hidden />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Pager
                page={listQuery.data?.page ?? page}
                pageCount={listQuery.data?.pageCount ?? 0}
                onPage={setPage}
              />
            </motion.section>
          </>
        )}
      </motion.div>
    </MotionConfig>
  );
}

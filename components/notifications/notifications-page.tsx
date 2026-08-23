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
        className="users-page"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        {listQuery.isLoading ? (
          <AdminListPageSkeleton rows={8} tabs={2} withSearch={false} withAction />
        ) : (
          <>
        <motion.header
          className="page-head row-between"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div>
            <p className="eyebrow">
              {listQuery.data?.unreadCount ?? 0} unread
            </p>
            <h1>Notifications</h1>
            <p className="lede" style={{ marginTop: 10, maxWidth: "46ch" }}>
              Payments, account changes, and plan events — in one quiet list.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={markAll.isPending || (listQuery.data?.unreadCount ?? 0) === 0}
            onClick={() => void readAll()}
          >
            <CheckCheck size={16} strokeWidth={2.2} aria-hidden />
            Mark all read
          </button>
        </motion.header>

            <QueryError error={listQuery.error} />

            <motion.div className="users-toolbar" variants={reduce ? undefined : fadeUpSoft}>
              <div className="tab-bar" role="tablist" aria-label="Notification filters">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!unreadOnly}
                  className={!unreadOnly ? "tab active" : "tab"}
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
                  className={unreadOnly ? "tab active" : "tab"}
                  onClick={() => {
                    setUnreadOnly(true);
                    setPage(1);
                  }}
                >
                  Unread
                </button>
              </div>
            </motion.div>

            <motion.section className="card" variants={reduce ? undefined : fadeUpSoft}>
              {rows.length === 0 ? (
                <p className="hint">Nothing in this inbox.</p>
              ) : (
                <ul className="notice-list">
                  {rows.map((item) => (
                    <li
                      key={item.id}
                      className={item.readAt ? "notice-row" : "notice-row is-unread"}
                    >
                      <div className="notice-icon" aria-hidden>
                        <Bell size={16} strokeWidth={2.2} />
                      </div>
                      <div className="admin-feed-copy">
                        <div className="users-name">{item.title}</div>
                        <p className="hint" style={{ marginTop: 4 }}>
                          {item.body}
                        </p>
                        <div className="users-email mono">
                          {formatDateTime(item.createdAt)}
                        </div>
                      </div>
                      <div className="users-actions">
                        {item.readAt ? null : (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => void read(item.id)}
                          >
                            Read
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-icon users-delete"
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

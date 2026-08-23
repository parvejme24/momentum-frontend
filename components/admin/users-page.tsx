"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Trash2 } from "lucide-react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";

import { RoleGate } from "@/components/app/role-gate";
import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { ConfirmSheet } from "@/components/settings/confirm-sheet";
import { AdminListPageSkeleton } from "@/components/ui/page-skeletons";
import { Pager } from "@/components/ui/pager";
import { QueryError } from "@/components/ui/query-error";
import {
  useAdminUsers,
  useDeleteAdminUser,
  useTrashAdminUser,
} from "@/lib/admin/hooks";
import {
  accountStatusChip,
  accountStatusLabel,
  formatLastActive,
  initialFromName,
  mutationErrorMessage,
  planName,
} from "@/lib/admin/map";
import type { AdminUser, AdminUserStatusFilter } from "@/lib/api/types";
import { isAdmin } from "@/lib/auth/role";
import { useAuth } from "@/lib/auth/context";

type FilterTab = AdminUserStatusFilter;

const TABS: { id: FilterTab; label: string }[] = [
  { id: "live", label: "Live" },
  { id: "active", label: "Active" },
  { id: "banned", label: "Banned" },
  { id: "trashed", label: "Trashed" },
  { id: "all", label: "All" },
];

export function UsersPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const admin = isAdmin(user);

  const [filter, setFilter] = useState<FilterTab>("live");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const listQuery = useMemo(
    () => ({
      status: filter,
      q: query.trim() || undefined,
      page,
      limit: 20,
      sort: "lastActiveAt" as const,
      order: "desc" as const,
    }),
    [filter, query, page],
  );

  const usersQuery = useAdminUsers(listQuery);
  const trashUser = useTrashAdminUser();
  const deleteUser = useDeleteAdminUser();
  const users = usersQuery.data?.users ?? [];
  const total = usersQuery.data?.total ?? 0;

  function changeFilter(next: FilterTab) {
    setFilter(next);
    setPage(1);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.status === "trashed") {
        await deleteUser.mutateAsync(deleteTarget.id);
        pushToast(`${deleteTarget.name} removed`);
      } else {
        await trashUser.mutateAsync(deleteTarget.id);
        pushToast(`${deleteTarget.name} moved to trash`);
      }
      setDeleteTarget(null);
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not update this account"));
    }
  }

  return (
    <RoleGate
      allowed={admin}
      title="Users"
      message="This screen is for Momentum admins. Your account doesn’t have access."
    >
      <MotionConfig reducedMotion="user">
        <motion.div
          className="users-page"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={reduce ? undefined : staggerContainer}
        >
          {usersQuery.isLoading ? (
            <AdminListPageSkeleton rows={8} tabs={5} />
          ) : (
            <>
          <motion.header
            className="page-head row-between users-head"
            variants={reduce ? undefined : fadeUpSoft}
          >
            <div>
              <p className="eyebrow">{total} accounts</p>
              <h1>Users</h1>
              <p className="lede" style={{ marginTop: 10, maxWidth: "46ch" }}>
                Ban, restore, or remove people — and open an account to see
                plans and payments.
              </p>
            </div>
          </motion.header>

              <QueryError error={usersQuery.error} fallback="Could not load users" />

              <motion.div
                className="users-toolbar"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div className="tab-bar" role="tablist" aria-label="User filters">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={filter === tab.id}
                      className={filter === tab.id ? "tab active" : "tab"}
                      onClick={() => changeFilter(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <label className="users-search">
                  <Search size={16} strokeWidth={2.2} aria-hidden />
                  <input
                    type="search"
                    className="input"
                    placeholder="Search name or email"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    aria-label="Search users"
                  />
                </label>
              </motion.div>

              <motion.section
                className="card users-table-card"
                aria-label="User list"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div className="users-table-head mono" aria-hidden>
                  <span>Person</span>
                  <span>Plan</span>
                  <span>Status</span>
                  <span>Habits</span>
                  <span>Last active</span>
                  <span />
                </div>

                <ul className="users-list">
                  <AnimatePresence mode="popLayout">
                    {users.map((item) => (
                      <motion.li
                        key={item.id}
                        className="users-row"
                        layout
                        initial={reduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? undefined : { opacity: 0, y: 6 }}
                      >
                        <div className="users-person">
                          <div className="avatar" aria-hidden>
                            {initialFromName(item.name)}
                          </div>
                          <div className="users-person-copy">
                            <div className="users-name">{item.name}</div>
                            <div className="users-email mono">{item.email}</div>
                            <div className="users-meta-mobile mono">
                              {planName(item)} · {accountStatusLabel(item.status)}
                            </div>
                          </div>
                        </div>
                        <span className="chip chip-quiet users-plan">
                          {planName(item)}
                        </span>
                        <span className={accountStatusChip(item.status)}>
                          {accountStatusLabel(item.status)}
                        </span>
                        <span className="mono users-habits">{item.habitCount}</span>
                        <span className="mono users-active">
                          {formatLastActive(item.lastActiveAt)}
                        </span>
                        <div className="users-actions">
                          <Link
                            href={`/users/${item.id}`}
                            className="btn btn-ghost btn-sm"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            className="btn-icon users-delete"
                            aria-label={
                              item.status === "trashed"
                                ? `Delete ${item.name}`
                                : `Trash ${item.name}`
                            }
                            title={
                              item.status === "trashed"
                                ? "Delete forever"
                                : "Move to trash"
                            }
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 size={16} strokeWidth={2.2} aria-hidden />
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                {users.length === 0 ? (
                  <p className="hint" style={{ marginTop: 8 }}>
                    No users match this filter.
                  </p>
                ) : null}

                <Pager
                  page={usersQuery.data?.page ?? page}
                  pageCount={usersQuery.data?.pageCount ?? 0}
                  onPage={setPage}
                />
              </motion.section>
            </>
          )}

          <ConfirmSheet
            open={deleteTarget !== null}
            onClose={() => setDeleteTarget(null)}
            title={
              deleteTarget?.status === "trashed"
                ? `Delete ${deleteTarget.name}?`
                : deleteTarget
                  ? `Trash ${deleteTarget.name}?`
                  : "Remove user?"
            }
          >
            <p className="hint" style={{ marginTop: 10, lineHeight: 1.55 }}>
              {deleteTarget?.status === "trashed"
                ? "This permanently deletes the account. Restore first if you might need it later."
                : "They leave the live list. You can restore them from Trashed."}
            </p>
            <div className="settings-actions" style={{ marginTop: 22 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setDeleteTarget(null)}
              >
                Keep user
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => void confirmDelete()}
                disabled={trashUser.isPending || deleteUser.isPending}
              >
                {deleteTarget?.status === "trashed" ? "Delete forever" : "Move to trash"}
              </button>
            </div>
          </ConfirmSheet>
        </motion.div>
      </MotionConfig>
    </RoleGate>
  );
}

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
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UsersTableSkeleton } from "@/components/ui/page-skeletons";
import { Pager } from "@/components/ui/pager";
import { QueryError } from "@/components/ui/query-error";
import {
  useAdminUsers,
  useDeleteAdminUser,
  useTrashAdminUser,
} from "@/lib/admin/hooks";
import {
  accountStatusLabel,
  formatLastActive,
  initialFromName,
  mutationErrorMessage,
  planName,
} from "@/lib/admin/map";
import type { AdminUser, AdminUserAccountStatus, AdminUserStatusFilter } from "@/lib/api/types";
import { isAdmin } from "@/lib/auth/role";
import { useAuth } from "@/lib/auth/context";
import { btn, btnDanger, btnGhost, btnSm, dialogBtn } from "@/lib/ui";
import { cn } from "@/lib/utils";

type FilterTab = AdminUserStatusFilter;

const TABS: { id: FilterTab; label: string }[] = [
  { id: "live", label: "Live" },
  { id: "active", label: "Active" },
  { id: "banned", label: "Banned" },
  { id: "trashed", label: "Trashed" },
  { id: "all", label: "All" },
];

const USER_ROW_GRID =
  "grid grid-cols-[minmax(0,2fr)_minmax(4.5rem,0.32fr)_minmax(5rem,0.38fr)_2.75rem_minmax(0,0.9fr)_auto] items-center gap-x-4 gap-y-3 max-[900px]:grid-cols-1 max-[900px]:gap-2.5";

function tabClass(active: boolean) {
  return cn(
    "cursor-pointer rounded-full border px-4 py-2 text-[0.88rem] font-semibold transition-all",
    active
      ? "border-ink bg-ink text-paper"
      : "border-foreground/10 bg-muted/30 text-muted-foreground hover:-translate-y-px hover:border-foreground/20 hover:bg-card hover:text-foreground",
  );
}

function accountStatusChipClass(status: AdminUserAccountStatus) {
  return cn(
    "inline-flex w-fit max-w-full shrink-0 items-center justify-center self-center justify-self-center whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.07em]",
    status === "active"
      ? "border-blue bg-blue-soft text-blue-deep"
      : status === "banned"
        ? "border-flame bg-flame-soft text-[#a8280c]"
        : "border-foreground/10 text-muted-foreground",
  );
}

function planChipClass() {
  return cn(
    "inline-flex w-fit max-w-full shrink-0 items-center self-center justify-self-start whitespace-nowrap rounded-full border border-foreground/10 px-2.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.07em] text-muted-foreground max-[900px]:hidden",
  );
}

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
  const total = usersQuery.data?.total;
  const tableLoading = usersQuery.isFetching;

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
          className="min-w-0"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={reduce ? undefined : staggerContainer}
        >
          <motion.header
            className="mb-4 flex flex-wrap items-center justify-between gap-4"
            variants={reduce ? undefined : fadeUpSoft}
          >
            <div>
              <p className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-blue">
                {tableLoading && total == null
                  ? "Loading accounts…"
                  : `${total ?? 0} accounts`}
              </p>
              <h1 className="mb-1.5 font-heading text-2xl font-bold tracking-tight">
                Users
              </h1>
              <p className="mt-2.5 max-w-[46ch] text-[clamp(1rem,1.6vw,1.18rem)] text-muted-foreground">
                Ban, restore, or remove people — and open an account to see
                plans and payments.
              </p>
            </div>
          </motion.header>

          <QueryError error={usersQuery.error} fallback="Could not load users" />

          <motion.div
            className="mb-[18px] flex flex-wrap items-end justify-between gap-4"
            variants={reduce ? undefined : fadeUpSoft}
          >
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="User filters">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === tab.id}
                  className={tabClass(filter === tab.id)}
                  onClick={() => changeFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative block min-w-[min(100%,280px)] max-w-[400px] flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
                strokeWidth={2.2}
                aria-hidden
              />
              <Input
                type="search"
                className="h-12 rounded-xl border-ink/8 bg-paper-white pl-11 text-[0.94rem] md:text-[0.94rem]"
                placeholder="Search name or email"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                aria-label="Search users"
              />
            </div>
          </motion.div>

          <motion.section variants={reduce ? undefined : fadeUpSoft}>
            <Card
              className="gap-0 overflow-hidden p-0"
              aria-label="User list"
              aria-busy={tableLoading}
            >
              <div
                className={cn(
                  USER_ROW_GRID,
                  "border-b border-ink/9 px-5 py-3.5 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground max-[900px]:hidden",
                )}
                aria-hidden
              >
                <span>Person</span>
                <span>Plan</span>
                <span className="text-center justify-self-center">Status</span>
                <span>Habits</span>
                <span>Last active</span>
                <span />
              </div>

              {tableLoading ? (
                <UsersTableSkeleton count={8} />
              ) : (
                <>
                  <ul className="m-0 list-none p-0">
                    <AnimatePresence mode="popLayout">
                      {users.map((item) => (
                        <motion.li
                          key={item.id}
                          className={cn(
                            USER_ROW_GRID,
                            "border-b border-ink/9 px-5 py-4 last:border-b-0 max-[900px]:py-4",
                          )}
                          layout
                          initial={reduce ? false : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reduce ? undefined : { opacity: 0, y: 6 }}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className="grid size-[38px] shrink-0 place-items-center rounded-lg border border-foreground/10 bg-flame font-heading text-sm font-extrabold text-white"
                              aria-hidden
                            >
                              {initialFromName(item.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold tracking-tight">
                                {item.name}
                              </div>
                              <div className="mt-0.5 font-mono text-[0.72rem] text-muted-foreground">
                                {item.email}
                              </div>
                              <div className="mt-1 hidden font-mono text-[0.68rem] text-muted-foreground max-[900px]:block">
                                {planName(item)} · {accountStatusLabel(item.status)}
                              </div>
                            </div>
                          </div>
                          <span className={planChipClass()}>{planName(item)}</span>
                          <span className={accountStatusChipClass(item.status)}>
                            {accountStatusLabel(item.status)}
                          </span>
                          <span className="font-mono max-[900px]:hidden">
                            {item.habitCount}
                          </span>
                          <span className="font-mono max-[900px]:hidden">
                            {formatLastActive(item.lastActiveAt)}
                          </span>
                          <div className="flex items-center justify-end gap-2 max-[900px]:flex-wrap max-[900px]:justify-start">
                            <Link
                              href={`/users/${item.id}`}
                              className={cn(btn, btnGhost, btnSm, "min-h-9 px-3.5")}
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              className={cn(btn, btnDanger, btnSm, "min-h-9 px-3.5")}
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
                              <Trash2 size={15} strokeWidth={2.2} aria-hidden />
                              {item.status === "trashed" ? "Delete" : "Trash"}
                            </button>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  {users.length === 0 ? (
                    <p className="px-5 py-4 text-[0.8rem] text-muted-foreground">
                      No users match this filter.
                    </p>
                  ) : null}

                  <div className="px-5 pb-5">
                    <Pager
                      page={usersQuery.data?.page ?? page}
                      pageCount={usersQuery.data?.pageCount ?? 0}
                      onPage={setPage}
                    />
                  </div>
                </>
              )}
            </Card>
          </motion.section>

          <Dialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {deleteTarget?.status === "trashed"
                    ? `Delete ${deleteTarget.name}?`
                    : deleteTarget
                      ? `Trash ${deleteTarget.name}?`
                      : "Remove user?"}
                </DialogTitle>
                <DialogDescription className="leading-relaxed">
                  {deleteTarget?.status === "trashed"
                    ? "This permanently deletes the account. Restore first if you might need it later."
                    : "They leave the live list. You can restore them from Trashed."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <button
                  type="button"
                  className={cn(dialogBtn, btnGhost)}
                  onClick={() => setDeleteTarget(null)}
                >
                  Keep user
                </button>
                <button
                  type="button"
                  className={cn(dialogBtn, btnDanger)}
                  disabled={trashUser.isPending || deleteUser.isPending}
                  onClick={() => void confirmDelete()}
                >
                  {deleteTarget?.status === "trashed" ? "Delete forever" : "Move to trash"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </MotionConfig>
    </RoleGate>
  );
}

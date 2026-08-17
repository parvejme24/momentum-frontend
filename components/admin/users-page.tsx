"use client";

import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";

import {
  MANAGED_USERS,
  planLabel,
  statusLabel,
  userCounts,
  type ManagedUser,
  type ManagedUserStatus,
} from "@/components/admin/users-data";
import { RoleGate } from "@/components/app/role-gate";
import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { ConfirmSheet } from "@/components/settings/confirm-sheet";
import { isAdmin } from "@/lib/auth/role";
import { useAuth } from "@/lib/auth/context";

type FilterTab = "all" | ManagedUserStatus;

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "trial", label: "Trial" },
  { id: "cancelled", label: "Cancelled" },
  { id: "suspended", label: "Suspended" },
];

function initialFromName(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function statusChip(status: ManagedUserStatus) {
  if (status === "active") return "chip chip-blue";
  if (status === "trial") return "chip chip-flame";
  return "chip chip-quiet";
}

export function UsersPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const admin = isAdmin(user);

  const [users, setUsers] = useState(MANAGED_USERS);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((item) => {
      if (filter !== "all" && item.status !== filter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q)
      );
    });
  }, [users, filter, query]);

  const summary = useMemo(() => {
    const counts = userCounts(users);
    return [
      { key: "Total", value: String(counts.total), note: "accounts" },
      { key: "Active", value: String(counts.active), note: "currently marking" },
      { key: "On trial", value: String(counts.trial), note: "free window open" },
      { key: "Paid plans", value: String(counts.paid), note: "Pro or Team" },
    ];
  }, [users]);

  function confirmDelete() {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    pushToast(`Removed ${deleteTarget.name}`);
    setDeleteTarget(null);
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
        <motion.header
          className="page-head row-between users-head"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div>
            <p className="eyebrow">{users.length} accounts</p>
            <h1>Users</h1>
            <p className="lede" style={{ marginTop: 10, maxWidth: "46ch" }}>
              Who’s on Momentum — plans, status, and last activity. Calm admin
              view, not a CRM dashboard.
            </p>
          </div>
        </motion.header>

        <motion.section
          className="grid-4 users-summary"
          aria-label="User summary"
          variants={reduce ? undefined : fadeUpSoft}
        >
          {summary.map((tile) => (
            <article key={tile.key} className="stat card-hover">
              <div className="stat-k">{tile.key}</div>
              <div className="stat-v">{tile.value}</div>
              <div className="stat-n">{tile.note}</div>
            </article>
          ))}
        </motion.section>

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
                onClick={() => setFilter(tab.id)}
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
              onChange={(e) => setQuery(e.target.value)}
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
              {filtered.map((item) => (
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
                        Joined {item.joinedAt} · {item.timezone}
                      </div>
                    </div>
                  </div>
                  <span className="chip chip-quiet users-plan">
                    {planLabel(item.plan)}
                  </span>
                  <span className={statusChip(item.status)}>
                    {statusLabel(item.status)}
                  </span>
                  <span className="mono users-habits">{item.habits}</span>
                  <span className="mono users-active">{item.lastActive}</span>
                  <div className="users-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        pushToast(`Opened ${item.name} — detail comes next`)
                      }
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="btn-icon users-delete"
                      aria-label={`Delete ${item.name}`}
                      title="Delete user"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 size={16} strokeWidth={2.2} aria-hidden />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {filtered.length === 0 ? (
            <p className="hint" style={{ marginTop: 8 }}>
              No users match this filter.
            </p>
          ) : null}
        </motion.section>

        <ConfirmSheet
          open={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          title={
            deleteTarget
              ? `Remove ${deleteTarget.name}?`
              : "Remove user?"
          }
        >
          <p className="hint" style={{ marginTop: 10, lineHeight: 1.55 }}>
            Their account, habits, and history leave the admin list. This demo
            only updates local sample data.
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
              onClick={confirmDelete}
            >
              Remove user
            </button>
          </div>
        </ConfirmSheet>
      </motion.div>
    </MotionConfig>
    </RoleGate>
  );
}

"use client";

import Link from "next/link";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import {
  MANAGED_USERS,
  planLabel,
  statusLabel,
  userCounts,
} from "@/components/admin/users-data";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { useAuth } from "@/lib/auth/context";

function initialFromName(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function statusChip(status: (typeof MANAGED_USERS)[number]["status"]) {
  if (status === "active") return "chip chip-blue";
  if (status === "trial") return "chip chip-flame";
  return "chip chip-quiet";
}

export function AdminDashboard() {
  const reduce = useReducedMotion();
  const { user } = useAuth();
  const counts = userCounts(MANAGED_USERS);
  const recent = MANAGED_USERS.slice(0, 4);
  const flagged = counts.flagged;
  const firstName = (user?.name?.trim() || "there").split(" ")[0];

  const summary = [
    { key: "Accounts", value: String(counts.total), note: "on Momentum" },
    { key: "Active", value: String(counts.active), note: "currently marking" },
    { key: "On trial", value: String(counts.trial), note: "free window open" },
    { key: "Paid plans", value: String(counts.paid), note: "Pro or Team" },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="admin-dash"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <motion.header
          className="page-head row-between"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Dashboard</h1>
            <p className="lede" style={{ marginTop: 10, maxWidth: "46ch" }}>
              Hello {firstName}. Accounts, plans, and the people who need a
              look — not a CRM wall.
            </p>
          </div>
          <Link href="/users" className="btn btn-sm today-new-desktop">
            Manage users
          </Link>
        </motion.header>

        <motion.section
          className="grid-4 users-summary"
          aria-label="Account summary"
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
          className="admin-dash-split"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <section className="card" aria-labelledby="recent-heading">
            <div className="panel-head">
              <h2 id="recent-heading" className="section-title">
                Recent activity
              </h2>
              <Link href="/users" className="auth-inline-link mono">
                All users →
              </Link>
            </div>
            <ul className="admin-feed">
              {recent.map((item) => (
                <li key={item.id} className="admin-feed-item">
                  <div className="avatar" aria-hidden>
                    {initialFromName(item.name)}
                  </div>
                  <div className="admin-feed-copy">
                    <div className="users-name">{item.name}</div>
                    <div className="users-email mono">
                      {planLabel(item.plan)} · {item.lastActive}
                    </div>
                  </div>
                  <span className={statusChip(item.status)}>
                    {statusLabel(item.status)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card" aria-labelledby="attention-heading">
            <div className="panel-head">
              <h2 id="attention-heading" className="section-title">
                Needs a look
              </h2>
              <span className="chip chip-quiet">{flagged.length}</span>
            </div>
            {flagged.length === 0 ? (
              <p className="hint">Nothing flagged right now.</p>
            ) : (
              <ul className="admin-feed">
                {flagged.map((item) => (
                  <li key={item.id} className="admin-feed-item">
                    <div className="avatar" aria-hidden>
                      {initialFromName(item.name)}
                    </div>
                    <div className="admin-feed-copy">
                      <div className="users-name">{item.name}</div>
                      <div className="users-email mono">{item.email}</div>
                    </div>
                    <span className={statusChip(item.status)}>
                      {statusLabel(item.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p style={{ marginTop: 18 }}>
              <Link href="/users" className="btn btn-ghost btn-sm">
                Review accounts
              </Link>
            </p>
          </section>
        </motion.div>
      </motion.div>
    </MotionConfig>
  );
}

"use client";

import Link from "next/link";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { AdminDashboardSkeleton } from "@/components/ui/page-skeletons";
import { QueryError } from "@/components/ui/query-error";
import {
  useAdminPayments,
  useAdminRevenue,
  useAdminUsers,
} from "@/lib/admin/hooks";
import { allTimeRevenueQuery } from "@/lib/admin/live";
import {
  accountStatusChip,
  accountStatusLabel,
  formatLastActive,
  initialFromName,
  paymentMethodLabel,
  paymentStatusChip,
  paymentStatusLabel,
  planName,
} from "@/lib/admin/map";
import { useAuth } from "@/lib/auth/context";
import { formatPrettyIso } from "@/lib/dates";
import { formatCents } from "@/lib/money";
import { useNotifications } from "@/lib/notifications/hooks";

export function AdminDashboard() {
  const reduce = useReducedMotion();
  const { user } = useAuth();
  const liveQuery = useAdminUsers({
    status: "live",
    limit: 6,
    sort: "lastActiveAt",
    order: "desc",
  });
  const allQuery = useAdminUsers({ status: "all", limit: 1 });
  const bannedQuery = useAdminUsers({ status: "banned", limit: 6 });
  const revenueQuery = useAdminRevenue(allTimeRevenueQuery());
  const paymentsQuery = useAdminPayments({ page: 1, limit: 12 });
  const notesQuery = useNotifications({ limit: 5 });

  const loading =
    liveQuery.isLoading ||
    allQuery.isLoading ||
    bannedQuery.isLoading ||
    revenueQuery.isLoading ||
    paymentsQuery.isLoading;

  const live = liveQuery.data?.users ?? [];
  const banned = bannedQuery.data?.users ?? [];
  const flagged = [
    ...banned,
    ...live.filter((item) => item.plan?.status === "past_due"),
  ].slice(0, 6);
  const payments = paymentsQuery.data?.payments ?? [];
  const paymentTotal = paymentsQuery.data?.total ?? 0;
  const firstName = (user?.name?.trim() || "there").split(" ")[0];
  const totals = revenueQuery.data?.totals;
  const currency = revenueQuery.data?.currency ?? "USD";

  const summary = [
    {
      key: "Accounts",
      value: String(allQuery.data?.total ?? 0),
      note: "on Momentum",
    },
    {
      key: "Gross",
      value: formatCents(totals?.grossCents ?? 0, currency),
      note: "all collected",
    },
    {
      key: "Net",
      value: formatCents(totals?.netCents ?? 0, currency),
      note: "minus refunds",
    },
    {
      key: "Payments",
      value: String(paymentTotal || totals?.paymentCount || 0),
      note: "all recorded",
    },
  ];

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

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
              Hello {firstName}. Accounts, live payments, and the people who need
              a look.
            </p>
          </div>
          <Link href="/users" className="btn btn-sm today-new-desktop">
            Manage users
          </Link>
        </motion.header>

        <QueryError
          error={
            liveQuery.error ||
            allQuery.error ||
            bannedQuery.error ||
            revenueQuery.error ||
            paymentsQuery.error
          }
        />

        <motion.section
          className="grid-4 users-summary"
          aria-label="Account and revenue summary"
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

        <motion.section
          className="card"
          style={{ marginTop: 18 }}
          aria-labelledby="payments-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className="panel-head">
            <h2 id="payments-heading" className="section-title">
              Payments
            </h2>
            <Link href="/payments" className="auth-inline-link mono">
              All {paymentTotal > 0 ? `${paymentTotal} →` : "→"}
            </Link>
          </div>
          {payments.length === 0 ? (
            <p className="hint">No payments yet.</p>
          ) : (
            <ul className="admin-feed">
              {payments.map((item) => (
                <li key={item.id} className="admin-feed-item">
                  <div className="admin-feed-copy">
                    <Link href={`/users/${item.user.id}`} className="users-name">
                      {item.user.name}
                    </Link>
                    <div className="users-email mono">
                      {formatCents(item.amountCents, item.currency)} ·{" "}
                      {item.plan?.name ?? "No plan"} ·{" "}
                      {paymentMethodLabel(item.method)} ·{" "}
                      {formatPrettyIso(item.paidAt)}
                    </div>
                  </div>
                  <span className={paymentStatusChip(item.status)}>
                    {paymentStatusLabel(item.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
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
            {live.length === 0 ? (
              <p className="hint">No accounts yet.</p>
            ) : (
              <ul className="admin-feed">
                {live.map((item) => (
                  <li key={item.id} className="admin-feed-item">
                    <div className="avatar" aria-hidden>
                      {initialFromName(item.name)}
                    </div>
                    <div className="admin-feed-copy">
                      <Link href={`/users/${item.id}`} className="users-name">
                        {item.name}
                      </Link>
                      <div className="users-email mono">
                        {planName(item)} · {formatLastActive(item.lastActiveAt)}
                      </div>
                    </div>
                    <span className={accountStatusChip(item.status)}>
                      {accountStatusLabel(item.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
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
                      <Link href={`/users/${item.id}`} className="users-name">
                        {item.name}
                      </Link>
                      <div className="users-email mono">{item.email}</div>
                    </div>
                    <span className={accountStatusChip(item.status)}>
                      {item.plan?.status === "past_due"
                        ? "Past due"
                        : accountStatusLabel(item.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p style={{ marginTop: 18 }}>
              <Link href="/payments" className="btn btn-ghost btn-sm">
                Review payments
              </Link>
            </p>
          </section>
        </motion.div>

        <motion.section
          className="card"
          style={{ marginTop: 18 }}
          aria-labelledby="notes-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className="panel-head">
            <h2 id="notes-heading" className="section-title">
              Notifications
            </h2>
            <Link href="/notifications" className="auth-inline-link mono">
              Inbox →
            </Link>
          </div>
          {(notesQuery.data?.notifications ?? []).length === 0 ? (
            <p className="hint">No admin notices yet.</p>
          ) : (
            <ul className="admin-feed">
              {notesQuery.data?.notifications.map((item) => (
                <li key={item.id} className="admin-feed-item">
                  <div className="admin-feed-copy">
                    <div className="users-name">{item.title}</div>
                    <div className="users-email">{item.body}</div>
                  </div>
                  {item.readAt ? null : (
                    <span className="chip chip-flame">New</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      </motion.div>
    </MotionConfig>
  );
}

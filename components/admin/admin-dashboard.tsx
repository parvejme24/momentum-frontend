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
import {
  avatar,
  btn,
  btnGhost,
  btnSm,
  card,
  cardHover,
  chip,
  chipFlame,
  chipQuiet,
  eyebrow,
  hint,
  inlineLink,
  lede,
  mono,
  pageHead,
  panelHead,
  rowBetween,
  sectionTitle,
  stat,
  statK,
  statN,
  statV,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

const FEED = "m-0 list-none p-0";
const FEED_ITEM =
  "flex items-center gap-3 border-b border-ink/8 py-3 last:border-b-0 last:pb-0 dark:border-[rgba(221,216,207,0.08)]";
const FEED_COPY = "min-w-0 flex-1";
const PERSON_NAME = "font-bold tracking-[-0.01em]";
const PERSON_META = cn(mono, "mt-0.5 text-[0.72rem] text-ink-50");

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
        className="min-w-0"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <motion.header
          className={cn(pageHead, rowBetween)}
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div>
            <p className={cn(eyebrow, "mb-2")}>Admin</p>
            <h1>Dashboard</h1>
            <p className={cn(lede, "mt-2.5 max-w-[46ch]")}>
              Hello {firstName}. Accounts, live payments, and the people who need
              a look.
            </p>
          </div>
          <Link href="/users" className={cn(btn, btnSm, "shrink-0 max-nav:hidden")}>
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
          className="mb-[22px] grid grid-cols-1 gap-6 min-[641px]:grid-cols-2 wide:grid-cols-4"
          aria-label="Account and revenue summary"
          variants={reduce ? undefined : fadeUpSoft}
        >
          {summary.map((tile) => (
            <article key={tile.key} className={cn(stat, cardHover)}>
              <div className={statK}>{tile.key}</div>
              <div className={statV}>{tile.value}</div>
              <div className={statN}>{tile.note}</div>
            </article>
          ))}
        </motion.section>

        <motion.section
          className={cn(card, "mt-[18px]")}
          aria-labelledby="payments-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className={panelHead}>
            <h2 id="payments-heading" className={sectionTitle}>
              Payments
            </h2>
            <Link href="/payments" className={cn(inlineLink, mono)}>
              All {paymentTotal > 0 ? `${paymentTotal} →` : "→"}
            </Link>
          </div>
          {payments.length === 0 ? (
            <p className={hint}>No payments yet.</p>
          ) : (
            <ul className={FEED}>
              {payments.map((item) => (
                <li key={item.id} className={FEED_ITEM}>
                  <div className={FEED_COPY}>
                    <Link href={`/users/${item.user.id}`} className={PERSON_NAME}>
                      {item.user.name}
                    </Link>
                    <div className={PERSON_META}>
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
          className="mt-[18px] grid grid-cols-1 gap-6 nav:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)]"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <section className={card} aria-labelledby="recent-heading">
            <div className={panelHead}>
              <h2 id="recent-heading" className={sectionTitle}>
                Recent activity
              </h2>
              <Link href="/users" className={cn(inlineLink, mono)}>
                All users →
              </Link>
            </div>
            {live.length === 0 ? (
              <p className={hint}>No accounts yet.</p>
            ) : (
              <ul className={FEED}>
                {live.map((item) => (
                  <li key={item.id} className={FEED_ITEM}>
                    <div className={avatar} aria-hidden>
                      {initialFromName(item.name)}
                    </div>
                    <div className={FEED_COPY}>
                      <Link href={`/users/${item.id}`} className={PERSON_NAME}>
                        {item.name}
                      </Link>
                      <div className={PERSON_META}>
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

          <section className={card} aria-labelledby="attention-heading">
            <div className={panelHead}>
              <h2 id="attention-heading" className={sectionTitle}>
                Needs a look
              </h2>
              <span className={cn(chip, chipQuiet)}>{flagged.length}</span>
            </div>
            {flagged.length === 0 ? (
              <p className={hint}>Nothing flagged right now.</p>
            ) : (
              <ul className={FEED}>
                {flagged.map((item) => (
                  <li key={item.id} className={FEED_ITEM}>
                    <div className={avatar} aria-hidden>
                      {initialFromName(item.name)}
                    </div>
                    <div className={FEED_COPY}>
                      <Link href={`/users/${item.id}`} className={PERSON_NAME}>
                        {item.name}
                      </Link>
                      <div className={PERSON_META}>{item.email}</div>
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
            <p className="mt-[18px]">
              <Link href="/payments" className={cn(btn, btnGhost, btnSm)}>
                Review payments
              </Link>
            </p>
          </section>
        </motion.div>

        <motion.section
          className={cn(card, "mt-[18px]")}
          aria-labelledby="notes-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className={panelHead}>
            <h2 id="notes-heading" className={sectionTitle}>
              Notifications
            </h2>
            <Link href="/notifications" className={cn(inlineLink, mono)}>
              Inbox →
            </Link>
          </div>
          {(notesQuery.data?.notifications ?? []).length === 0 ? (
            <p className={hint}>No admin notices yet.</p>
          ) : (
            <ul className={FEED}>
              {notesQuery.data?.notifications.map((item) => (
                <li key={item.id} className={FEED_ITEM}>
                  <div className={FEED_COPY}>
                    <div className={PERSON_NAME}>{item.title}</div>
                    <div className="mt-0.5 text-[0.72rem] text-ink-50">{item.body}</div>
                  </div>
                  {item.readAt ? null : (
                    <span className={cn(chip, chipFlame)}>New</span>
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

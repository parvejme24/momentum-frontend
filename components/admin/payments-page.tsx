"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { RoleGate } from "@/components/app/role-gate";
import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { ConfirmSheet } from "@/components/settings/confirm-sheet";
import { AdminListPageSkeleton } from "@/components/ui/page-skeletons";
import { Pager } from "@/components/ui/pager";
import { QueryError } from "@/components/ui/query-error";
import {
  useAdminPayments,
  useAdminPlans,
  useAdminRevenue,
  useAdminUsers,
  useCreateAdminPayment,
  useRefundAdminPayment,
} from "@/lib/admin/hooks";
import { allTimeRevenueQuery } from "@/lib/admin/live";
import {
  mutationErrorMessage,
  paymentMethodLabel,
  paymentStatusChip,
  paymentStatusLabel,
} from "@/lib/admin/map";
import type { PaymentMethod, PaymentStatus } from "@/lib/api/types";
import { isAdmin } from "@/lib/auth/role";
import { useAuth } from "@/lib/auth/context";
import { formatPrettyIso } from "@/lib/dates";
import { dollarsToCents, formatCents } from "@/lib/money";

const STATUS_TABS: Array<{ id: PaymentStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "succeeded", label: "Paid" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
  { id: "refunded", label: "Refunded" },
];

export function PaymentsPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const admin = isAdmin(user);

  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [planId, setPlanId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("manual");

  const listQuery = useMemo(
    () => ({
      status: status === "all" ? undefined : status,
      page,
      limit: 20,
    }),
    [status, page],
  );

  const paymentsQuery = useAdminPayments(listQuery);
  const revenueQuery = useAdminRevenue(allTimeRevenueQuery());
  const usersQuery = useAdminUsers({ status: "live", limit: 100, sort: "name", order: "asc" });
  const plansQuery = useAdminPlans("published");
  const createPayment = useCreateAdminPayment();
  const refundPayment = useRefundAdminPayment();

  const rows = paymentsQuery.data?.payments ?? [];
  const people = usersQuery.data?.users ?? [];
  const plans = plansQuery.data ?? [];
  const totals = revenueQuery.data?.totals;
  const currency = revenueQuery.data?.currency ?? "USD";

  const summary = [
    { key: "Gross", value: formatCents(totals?.grossCents ?? 0, currency), note: "collected" },
    { key: "Refunded", value: formatCents(totals?.refundedCents ?? 0, currency), note: "sent back" },
    { key: "Net", value: formatCents(totals?.netCents ?? 0, currency), note: "kept" },
    { key: "Payments", value: String(totals?.paymentCount ?? 0), note: "all time" },
  ];

  async function create() {
    if (!userId || !amount) {
      pushToast("Pick a person and an amount");
      return;
    }
    try {
      await createPayment.mutateAsync({
        userId,
        planId: planId || undefined,
        amountCents: dollarsToCents(amount),
        method,
        status: "succeeded",
      });
      pushToast("Payment recorded");
      setCreateOpen(false);
      setUserId("");
      setPlanId("");
      setAmount("");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not record payment"));
    }
  }

  async function refund(id: string) {
    try {
      await refundPayment.mutateAsync({ id });
      pushToast("Payment refunded");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not refund"));
    }
  }

  return (
    <RoleGate
      allowed={admin}
      title="Payments"
      message="This screen is for Momentum admins."
    >
      <MotionConfig reducedMotion="user">
        <motion.div
          className="users-page"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={reduce ? undefined : staggerContainer}
        >
          {paymentsQuery.isLoading || revenueQuery.isLoading ? (
            <AdminListPageSkeleton
              rows={8}
              tabs={5}
              withSearch={false}
              withStats
              withAction
            />
          ) : (
            <>
          <motion.header
            className="page-head row-between"
            variants={reduce ? undefined : fadeUpSoft}
          >
            <div>
              <p className="eyebrow">Revenue</p>
              <h1>Payments</h1>
              <p className="lede" style={{ marginTop: 10, maxWidth: "46ch" }}>
                Record a payment by hand, refund one, and watch live totals update
                as Stripe and SSLCommerz checkouts land.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setCreateOpen(true)}
            >
              Record payment
            </button>
          </motion.header>

              <QueryError error={paymentsQuery.error || revenueQuery.error} />

              <motion.section
                className="grid-4 users-summary"
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
                <div className="tab-bar" role="tablist" aria-label="Payment filters">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={status === tab.id}
                      className={status === tab.id ? "tab active" : "tab"}
                      onClick={() => {
                        setStatus(tab.id);
                        setPage(1);
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.section
                className="card users-table-card"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div className="users-table-head admin-pay-head mono" aria-hidden>
                  <span>Person</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span>When</span>
                  <span />
                </div>
                <ul className="users-list">
                  {rows.map((item) => (
                    <li key={item.id} className="users-row admin-pay-row">
                      <div className="users-person-copy">
                        <Link href={`/users/${item.user.id}`} className="users-name">
                          {item.user.name}
                        </Link>
                        <div className="users-email mono">
                          {item.plan?.name ?? "No plan"} · {paymentMethodLabel(item.method)}
                        </div>
                      </div>
                      <span className="mono users-habits">
                        {formatCents(item.amountCents, item.currency)}
                      </span>
                      <span className={paymentStatusChip(item.status)}>
                        {paymentStatusLabel(item.status)}
                      </span>
                      <span className="mono users-active">
                        {formatPrettyIso(item.paidAt)}
                      </span>
                      <div className="users-actions">
                        {item.status === "succeeded" ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={refundPayment.isPending}
                            onClick={() => void refund(item.id)}
                          >
                            Refund
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
                {rows.length === 0 ? (
                  <p className="hint" style={{ marginTop: 8 }}>
                    No payments match this filter.
                  </p>
                ) : null}
                <Pager
                  page={paymentsQuery.data?.page ?? page}
                  pageCount={paymentsQuery.data?.pageCount ?? 0}
                  onPage={setPage}
                />
              </motion.section>
            </>
          )}

          <ConfirmSheet
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            title="Record a payment"
          >
            <label className="field" style={{ marginTop: 16 }}>
              <span className="label">Person</span>
              <select
                className="select"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                <option value="">Choose account</option>
                {people.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.email}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Plan</span>
              <select
                className="select"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
              >
                <option value="">Optional</option>
                {plans.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Amount</span>
              <input
                className="input"
                inputMode="decimal"
                placeholder="6.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="label">Method</span>
              <select
                className="select"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              >
                <option value="manual">Manual</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </label>
            <div className="settings-actions" style={{ marginTop: 22 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={createPayment.isPending}
                onClick={() => void create()}
              >
                Record
              </button>
            </div>
          </ConfirmSheet>
        </motion.div>
      </MotionConfig>
    </RoleGate>
  );
}

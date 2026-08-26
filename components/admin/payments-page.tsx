"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, User, Wallet } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { RoleGate } from "@/components/app/role-gate";
import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { AdminListPageSkeleton } from "@/components/ui/page-skeletons";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  paymentStatusLabel,
} from "@/lib/admin/map";
import type { PaymentMethod, PaymentStatus } from "@/lib/api/types";
import { isAdmin } from "@/lib/auth/role";
import { useAuth } from "@/lib/auth/context";
import { formatPrettyIso } from "@/lib/dates";
import { dollarsToCents, formatCents } from "@/lib/money";
import { btn, btnGhost, btnPrimary, btnSm, dialogBtn } from "@/lib/ui";
import { cn } from "@/lib/utils";

const STATUS_TABS: Array<{ id: PaymentStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "succeeded", label: "Paid" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
  { id: "refunded", label: "Refunded" },
];

const paymentTableGrid =
  "grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(6.5rem,0.85fr)_minmax(0,0.95fr)_auto] items-center gap-x-4 gap-y-2 max-[900px]:grid-cols-1";

const METHOD_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "manual", label: "Manual" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];

function tabClass(active: boolean) {
  return cn(
    "cursor-pointer rounded-full border px-4 py-2 text-[0.88rem] font-semibold transition-all",
    active
      ? "border-ink bg-ink text-paper"
      : "border-foreground/10 bg-muted/30 text-muted-foreground hover:-translate-y-px hover:border-foreground/20 hover:bg-card hover:text-foreground",
  );
}

function paymentStatusChipClass(status: PaymentStatus) {
  return cn(
    "inline-flex w-fit max-w-full shrink-0 items-center justify-center self-center whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.07em]",
    status === "succeeded"
      ? "border-blue bg-blue-soft text-blue-deep"
      : status === "failed"
        ? "border-flame bg-flame-soft text-[#a8280c]"
        : "border-foreground/10 text-muted-foreground",
  );
}

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

  const personOptions = useMemo(
    () =>
      people.map((item) => ({
        value: item.id,
        label: item.name,
        hint: item.email,
      })),
    [people],
  );

  const planOptions = useMemo(
    () => [
      { value: "", label: "No plan", hint: "Optional" },
      ...plans.map((item) => ({
        value: item.id,
        label: item.name,
        hint: formatCents(item.priceCents, item.currency),
      })),
    ],
    [plans],
  );

  function selectPlan(nextPlanId: string) {
    setPlanId(nextPlanId);
    if (!nextPlanId) return;
    const plan = plans.find((item) => item.id === nextPlanId);
    if (!plan) return;
    setAmount((plan.priceCents / 100).toFixed(2));
  }

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
          className="min-w-0"
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
                className="mb-4 flex flex-wrap items-center justify-between gap-4"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div>
                  <p className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-blue">
                    Revenue
                  </p>
                  <h1 className="mb-1.5 font-heading text-2xl font-bold tracking-tight">
                    Payments
                  </h1>
                  <p className="mt-2.5 max-w-[46ch] text-[clamp(1rem,1.6vw,1.18rem)] text-muted-foreground">
                    Record a payment by hand, refund one, and watch live totals update
                    as Stripe and SSLCommerz checkouts land.
                  </p>
                </div>
                <button
                  type="button"
                  className={cn(btn, btnPrimary, "min-h-12 min-w-[13.5rem] px-7")}
                  onClick={() => setCreateOpen(true)}
                >
                  Record payment
                </button>
              </motion.header>

              <QueryError error={paymentsQuery.error || revenueQuery.error} />

              <motion.section
                className="mb-5.5 grid grid-cols-1 gap-4.5 sm:grid-cols-2 xl:grid-cols-4"
                variants={reduce ? undefined : fadeUpSoft}
              >
                {summary.map((tile) => (
                  <Card
                    key={tile.key}
                    className="gap-0 p-5 transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-md"
                  >
                    <div className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                      {tile.key}
                    </div>
                    <div className="mt-1.5 font-mono text-[clamp(1.7rem,4vw,2.3rem)] font-bold leading-none tracking-tight tabular-nums">
                      {tile.value}
                    </div>
                    <div className="mt-1.5 text-[0.8rem] text-muted-foreground">
                      {tile.note}
                    </div>
                  </Card>
                ))}
              </motion.section>

              <motion.div
                className="mb-4.5 flex flex-wrap items-end justify-between gap-4"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Payment filters">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={status === tab.id}
                      className={tabClass(status === tab.id)}
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

              <motion.section variants={reduce ? undefined : fadeUpSoft}>
                <Card className="gap-0 overflow-hidden p-0">
                  <div
                    className={cn(
                      paymentTableGrid,
                      "border-b border-ink/9 px-5 py-3.5 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground max-[900px]:hidden",
                    )}
                    aria-hidden
                  >
                    <span>Person</span>
                    <span>Amount</span>
                    <span className="justify-self-center text-center">Status</span>
                    <span>When</span>
                    <span />
                  </div>
                  <ul className="m-0 list-none p-0">
                    {rows.map((item) => (
                      <li
                        key={item.id}
                        className={cn(
                          paymentTableGrid,
                          "border-b border-ink/9 px-5 py-4 last:border-b-0",
                        )}
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/users/${item.user.id}`}
                            className="font-bold tracking-tight hover:underline"
                          >
                            {item.user.name}
                          </Link>
                          <div className="mt-0.5 font-mono text-[0.72rem] text-muted-foreground">
                            {item.plan?.name ?? "No plan"} · {paymentMethodLabel(item.method)}
                          </div>
                        </div>
                        <span className="font-mono text-[0.95rem] font-semibold tabular-nums">
                          {formatCents(item.amountCents, item.currency)}
                        </span>
                        <span className={cn(paymentStatusChipClass(item.status), "justify-self-center max-[900px]:justify-self-start")}>
                          {paymentStatusLabel(item.status)}
                        </span>
                        <span className="font-mono text-[0.92rem] tabular-nums text-ink-70">
                          {formatPrettyIso(item.paidAt)}
                        </span>
                        <div className="flex items-center justify-end gap-2">
                          {item.status === "succeeded" ? (
                            <button
                              type="button"
                              className={cn(btn, btnGhost, btnSm, "min-h-9 px-3.5")}
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
                    <p className="px-5 py-4 text-[0.8rem] text-muted-foreground">
                      No payments match this filter.
                    </p>
                  ) : null}
                  <div className="px-5 pb-5">
                    <Pager
                      page={paymentsQuery.data?.page ?? page}
                      pageCount={paymentsQuery.data?.pageCount ?? 0}
                      onPage={setPage}
                    />
                  </div>
                </Card>
              </motion.section>
            </>
          )}

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record a payment</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="payment-person">Person</Label>
                  <DropdownSelect
                    id="payment-person"
                    value={userId}
                    onChange={setUserId}
                    placeholder="Choose account"
                    aria-label="Person"
                    icon={User}
                    options={personOptions}
                    disabled={usersQuery.isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payment-plan">Plan</Label>
                  <DropdownSelect
                    id="payment-plan"
                    value={planId}
                    onChange={selectPlan}
                    placeholder="Optional"
                    aria-label="Plan"
                    icon={CreditCard}
                    options={planOptions}
                    disabled={plansQuery.isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payment-amount">Amount</Label>
                  <Input
                    id="payment-amount"
                    inputMode="decimal"
                    placeholder="6.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payment-method">Method</Label>
                  <DropdownSelect
                    id="payment-method"
                    value={method}
                    onChange={(value) => setMethod(value as PaymentMethod)}
                    placeholder="Choose method"
                    aria-label="Method"
                    icon={Wallet}
                    options={METHOD_OPTIONS}
                  />
                </div>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  className={cn(dialogBtn, btnGhost)}
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={cn(dialogBtn, btnPrimary)}
                  disabled={createPayment.isPending}
                  onClick={() => void create()}
                >
                  Record
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </MotionConfig>
    </RoleGate>
  );
}

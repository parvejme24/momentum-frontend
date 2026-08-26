"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, User } from "lucide-react";
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
  useAdminPlans,
  useAdminSubscriptions,
  useAdminUsers,
  useCancelAdminSubscription,
  useCreateAdminSubscription,
  useRenewAdminSubscription,
} from "@/lib/admin/hooks";
import {
  mutationErrorMessage,
  subscriptionStatusLabel,
} from "@/lib/admin/map";
import type { SubscriptionStatus } from "@/lib/api/types";
import { isAdmin } from "@/lib/auth/role";
import { useAuth } from "@/lib/auth/context";
import { formatPrettyIso } from "@/lib/dates";
import { formatCents } from "@/lib/money";
import { btn, btnGhost, btnPrimary, btnSm, dialogBtn } from "@/lib/ui";
import { cn } from "@/lib/utils";

const STATUS_TABS: Array<{ id: SubscriptionStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "trialing", label: "Trial" },
  { id: "past_due", label: "Past due" },
  { id: "canceled", label: "Canceled" },
  { id: "expired", label: "Expired" },
];

const TABLE_GRID =
  "grid items-center gap-x-4 gap-y-2 [grid-template-columns:minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(6.5rem,0.85fr)_minmax(0,0.95fr)_auto] max-[900px]:grid-cols-1";

const CHIP_BASE =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.07em]";

function tabClass(active: boolean) {
  return cn(
    "cursor-pointer rounded-full border px-4 py-2 text-[0.88rem] font-semibold transition-all",
    active
      ? "border-ink bg-ink text-paper"
      : "border-foreground/10 bg-muted/30 text-muted-foreground hover:-translate-y-px hover:border-foreground/20 hover:bg-card hover:text-foreground",
  );
}

function planChipClass() {
  return cn(CHIP_BASE, "border-foreground/10 text-muted-foreground");
}

function subscriptionStatusChipClass(status: SubscriptionStatus) {
  if (status === "active") {
    return cn(CHIP_BASE, "border-blue bg-blue-soft text-blue-deep");
  }
  if (status === "trialing" || status === "past_due") {
    return cn(CHIP_BASE, "border-flame bg-flame-soft text-[#a8280c]");
  }
  return cn(CHIP_BASE, "border-foreground/10 text-muted-foreground");
}

export function SubscriptionsPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const admin = isAdmin(user);

  const [status, setStatus] = useState<SubscriptionStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [planId, setPlanId] = useState("");
  const [seats, setSeats] = useState("1");

  const listQuery = useMemo(
    () => ({
      status: status === "all" ? undefined : status,
      page,
      limit: 20,
    }),
    [status, page],
  );

  const subsQuery = useAdminSubscriptions(listQuery);
  const usersQuery = useAdminUsers({ status: "live", limit: 100, sort: "name", order: "asc" });
  const plansQuery = useAdminPlans("published");
  const createSub = useCreateAdminSubscription();
  const cancelSub = useCancelAdminSubscription();
  const renewSub = useRenewAdminSubscription();

  const rows = subsQuery.data?.subscriptions ?? [];
  const people = usersQuery.data?.users ?? [];
  const plans = plansQuery.data ?? [];

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
    () =>
      plans.map((item) => ({
        value: item.id,
        label: item.name,
        hint: formatCents(item.priceCents, item.currency),
      })),
    [plans],
  );

  async function create() {
    if (!userId || !planId) {
      pushToast("Pick a person and a plan");
      return;
    }
    try {
      await createSub.mutateAsync({
        userId,
        planId,
        seats: Number.parseInt(seats, 10) || 1,
        payment: { method: "manual", status: "succeeded" },
      });
      pushToast("Subscription created");
      setCreateOpen(false);
      setUserId("");
      setPlanId("");
      setSeats("1");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not create subscription"));
    }
  }

  async function cancel(id: string) {
    try {
      await cancelSub.mutateAsync({ id, atPeriodEnd: false });
      pushToast("Subscription canceled");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not cancel"));
    }
  }

  async function renew(id: string) {
    try {
      await renewSub.mutateAsync({ id, body: { payment: { method: "manual" } } });
      pushToast("Subscription renewed");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not renew"));
    }
  }

  return (
    <RoleGate
      allowed={admin}
      title="Subscriptions"
      message="This screen is for Momentum admins."
    >
      <MotionConfig reducedMotion="user">
        <motion.div
          className="min-w-0"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={reduce ? undefined : staggerContainer}
        >
          {subsQuery.isLoading ? (
            <AdminListPageSkeleton rows={8} tabs={6} withSearch={false} withAction />
          ) : (
            <>
              <motion.header
                className="mb-4 flex flex-wrap items-center justify-between gap-4"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div>
                  <p className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-blue">
                    {subsQuery.data?.total ?? 0} plans in play
                  </p>
                  <h1 className="mb-1.5 font-heading text-2xl font-bold tracking-tight">
                    Subscriptions
                  </h1>
                  <p className="mt-2.5 max-w-[46ch] text-[clamp(1rem,1.6vw,1.18rem)] text-muted-foreground">
                    Assign a plan, cancel, or record a renewal without leaving the admin desk.
                  </p>
                </div>
                <button
                  type="button"
                  className={cn(btn, btnPrimary, "min-h-12 min-w-[13.5rem] px-7")}
                  onClick={() => setCreateOpen(true)}
                >
                  New subscription
                </button>
              </motion.header>

              <QueryError error={subsQuery.error} />

              <motion.div
                className="mb-[18px] flex flex-wrap items-end justify-between gap-4"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Subscription filters">
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
                      TABLE_GRID,
                      "border-b border-ink/9 px-5 py-3.5 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground max-[900px]:hidden",
                    )}
                    aria-hidden
                  >
                    <span>Person</span>
                    <span>Plan</span>
                    <span className="justify-self-center text-center">Status</span>
                    <span>Period</span>
                    <span />
                  </div>
                  <ul className="m-0 list-none p-0">
                    {rows.map((item) => (
                      <li
                        key={item.id}
                        className={cn(
                          TABLE_GRID,
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
                            {item.user.email}
                          </div>
                        </div>
                        <span className={cn(planChipClass(), "max-w-full justify-self-start")}>
                          {item.plan.name} · {formatCents(item.plan.priceCents, item.plan.currency)}
                        </span>
                        <span
                          className={cn(
                            subscriptionStatusChipClass(item.status),
                            "max-w-full justify-self-center whitespace-nowrap",
                          )}
                        >
                          {subscriptionStatusLabel(item.status)}
                        </span>
                        <span className="font-mono text-[0.92rem] tabular-nums text-ink-70">
                          {item.currentPeriodEnd
                            ? formatPrettyIso(item.currentPeriodEnd)
                            : "Open"}
                        </span>
                        <div className="flex items-center justify-end gap-2">
                          {item.status === "active" ||
                          item.status === "trialing" ||
                          item.status === "past_due" ? (
                            <button
                              type="button"
                              className={cn(btn, btnGhost, btnSm, "min-h-9 px-3.5")}
                              disabled={cancelSub.isPending}
                              onClick={() => void cancel(item.id)}
                            >
                              Cancel
                            </button>
                          ) : (
                            <button
                              type="button"
                              className={cn(btn, btnGhost, btnSm, "min-h-9 px-3.5")}
                              disabled={renewSub.isPending}
                              onClick={() => void renew(item.id)}
                            >
                              Renew
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {rows.length === 0 ? (
                    <p className="px-5 py-4 text-[0.8rem] text-muted-foreground">
                      No subscriptions match this filter.
                    </p>
                  ) : null}
                  <div className="px-5 pb-5">
                    <Pager
                      page={subsQuery.data?.page ?? page}
                      pageCount={subsQuery.data?.pageCount ?? 0}
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
                <DialogTitle>Assign a plan</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Person</Label>
                  <DropdownSelect
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
                  <Label>Plan</Label>
                  <DropdownSelect
                    value={planId}
                    onChange={setPlanId}
                    placeholder="Choose plan"
                    aria-label="Plan"
                    icon={CreditCard}
                    options={planOptions}
                    disabled={plansQuery.isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subscription-seats">Seats</Label>
                  <Input
                    id="subscription-seats"
                    type="number"
                    min={1}
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
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
                  disabled={createSub.isPending}
                  onClick={() => void create()}
                >
                  Create
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </MotionConfig>
    </RoleGate>
  );
}

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
  useAdminPlans,
  useAdminSubscriptions,
  useAdminUsers,
  useCancelAdminSubscription,
  useCreateAdminSubscription,
  useRenewAdminSubscription,
} from "@/lib/admin/hooks";
import {
  mutationErrorMessage,
  subscriptionStatusChip,
  subscriptionStatusLabel,
} from "@/lib/admin/map";
import type { SubscriptionStatus } from "@/lib/api/types";
import { isAdmin } from "@/lib/auth/role";
import { useAuth } from "@/lib/auth/context";
import { formatPrettyIso } from "@/lib/dates";
import { formatCents } from "@/lib/money";

const STATUS_TABS: Array<{ id: SubscriptionStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "trialing", label: "Trial" },
  { id: "past_due", label: "Past due" },
  { id: "canceled", label: "Canceled" },
  { id: "expired", label: "Expired" },
];

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
          className="users-page"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={reduce ? undefined : staggerContainer}
        >
          {subsQuery.isLoading ? (
            <AdminListPageSkeleton rows={8} tabs={6} withSearch={false} withAction />
          ) : (
            <>
          <motion.header
            className="page-head row-between"
            variants={reduce ? undefined : fadeUpSoft}
          >
            <div>
              <p className="eyebrow">{subsQuery.data?.total ?? 0} plans in play</p>
              <h1>Subscriptions</h1>
              <p className="lede" style={{ marginTop: 10, maxWidth: "46ch" }}>
                Assign a plan, cancel, or record a renewal without leaving the admin desk.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setCreateOpen(true)}
            >
              New subscription
            </button>
          </motion.header>

              <QueryError error={subsQuery.error} />

              <motion.div
                className="users-toolbar"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div className="tab-bar" role="tablist" aria-label="Subscription filters">
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
                <div className="users-table-head admin-sub-head mono" aria-hidden>
                  <span>Person</span>
                  <span>Plan</span>
                  <span>Status</span>
                  <span>Period</span>
                  <span />
                </div>
                <ul className="users-list">
                  {rows.map((item) => (
                    <li key={item.id} className="users-row admin-sub-row">
                      <div className="users-person-copy">
                        <Link href={`/users/${item.user.id}`} className="users-name">
                          {item.user.name}
                        </Link>
                        <div className="users-email mono">{item.user.email}</div>
                      </div>
                      <span className="chip chip-quiet">
                        {item.plan.name} · {formatCents(item.plan.priceCents, item.plan.currency)}
                      </span>
                      <span className={subscriptionStatusChip(item.status)}>
                        {subscriptionStatusLabel(item.status)}
                      </span>
                      <span className="mono users-active">
                        {item.currentPeriodEnd
                          ? formatPrettyIso(item.currentPeriodEnd)
                          : "Open"}
                      </span>
                      <div className="users-actions">
                        {item.status === "active" || item.status === "trialing" || item.status === "past_due" ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={cancelSub.isPending}
                            onClick={() => void cancel(item.id)}
                          >
                            Cancel
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
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
                  <p className="hint" style={{ marginTop: 8 }}>
                    No subscriptions match this filter.
                  </p>
                ) : null}
                <Pager
                  page={subsQuery.data?.page ?? page}
                  pageCount={subsQuery.data?.pageCount ?? 0}
                  onPage={setPage}
                />
              </motion.section>
            </>
          )}

          <ConfirmSheet
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            title="Assign a plan"
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
                <option value="">Choose plan</option>
                {plans.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {formatCents(item.priceCents, item.currency)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Seats</span>
              <input
                className="input"
                type="number"
                min={1}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
              />
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
                disabled={createSub.isPending}
                onClick={() => void create()}
              >
                Create
              </button>
            </div>
          </ConfirmSheet>
        </motion.div>
      </MotionConfig>
    </RoleGate>
  );
}

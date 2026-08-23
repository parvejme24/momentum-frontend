"use client";

import { useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { RoleGate } from "@/components/app/role-gate";
import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { ConfirmSheet } from "@/components/settings/confirm-sheet";
import { AdminListPageSkeleton } from "@/components/ui/page-skeletons";
import { QueryError } from "@/components/ui/query-error";
import {
  useAdminPlans,
  useArchiveAdminPlan,
  useCreateAdminPlan,
  useDeleteAdminPlan,
  usePublishAdminPlan,
  useUpdateAdminPlan,
} from "@/lib/admin/hooks";
import { mutationErrorMessage, planStatusLabel } from "@/lib/admin/map";
import type { AdminPlan, PlanInterval, PlanStatus } from "@/lib/api/types";
import { isAdmin } from "@/lib/auth/role";
import { useAuth } from "@/lib/auth/context";
import { dollarsToCents, formatCents, intervalLabel } from "@/lib/money";
import { planFeatureLabels } from "@/lib/pricing/features";

const STATUS_TABS: Array<{ id: PlanStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Draft" },
  { id: "archived", label: "Archived" },
];

const EMPTY_FORM = {
  name: "",
  slug: "",
  blurb: "",
  price: "0",
  interval: "month" as PlanInterval,
  features: "Unlimited habits",
};

export function PlansPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const admin = isAdmin(user);

  const [status, setStatus] = useState<PlanStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPlan | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AdminPlan | null>(null);

  const plansQuery = useAdminPlans(status);
  const createPlan = useCreateAdminPlan();
  const updatePlan = useUpdateAdminPlan();
  const publishPlan = usePublishAdminPlan();
  const archivePlan = useArchiveAdminPlan();
  const deletePlan = useDeleteAdminPlan();
  const plans = plansQuery.data ?? [];

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(plan: AdminPlan) {
    setEditing(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      blurb: plan.blurb,
      price: String(plan.priceCents / 100),
      interval: plan.interval,
      features: planFeatureLabels(plan.features).join("\n"),
    });
    setFormOpen(true);
  }

  async function save() {
    const features = form.features
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (!form.name.trim() || !form.slug.trim() || !form.blurb.trim() || features.length === 0) {
      pushToast("Name, slug, blurb, and at least one feature are required");
      return;
    }
    try {
      if (editing) {
        const result = await updatePlan.mutateAsync({
          id: editing.id,
          body: {
            name: form.name.trim(),
            slug: form.slug.trim(),
            blurb: form.blurb.trim(),
            priceCents: dollarsToCents(form.price),
            interval: form.interval,
            features,
          },
        });
        pushToast(result.message ?? "Plan updated");
      } else {
        await createPlan.mutateAsync({
          slug: form.slug.trim(),
          name: form.name.trim(),
          blurb: form.blurb.trim(),
          priceCents: dollarsToCents(form.price),
          interval: form.interval,
          features,
        });
        pushToast("Plan created");
      }
      setFormOpen(false);
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not save plan"));
    }
  }

  async function publish(id: string) {
    try {
      await publishPlan.mutateAsync(id);
      pushToast("Plan published");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not publish"));
    }
  }

  async function archive(id: string) {
    try {
      await archivePlan.mutateAsync(id);
      pushToast("Plan archived");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not archive"));
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    try {
      await deletePlan.mutateAsync(deleteTarget.id);
      pushToast(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not delete plan"));
    }
  }

  return (
    <RoleGate
      allowed={admin}
      title="Plans"
      message="This screen is for Momentum admins."
    >
      <MotionConfig reducedMotion="user">
        <motion.div
          className="users-page"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={reduce ? undefined : staggerContainer}
        >
          {plansQuery.isLoading ? (
            <AdminListPageSkeleton rows={6} tabs={4} withSearch={false} withAction />
          ) : (
            <>
          <motion.header
            className="page-head row-between"
            variants={reduce ? undefined : fadeUpSoft}
          >
            <div>
              <p className="eyebrow">Catalog</p>
              <h1>Plans</h1>
              <p className="lede" style={{ marginTop: 10, maxWidth: "46ch" }}>
                Draft, publish, and archive the public pricing catalog.
              </p>
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
              New plan
            </button>
          </motion.header>

              <QueryError error={plansQuery.error} />

              <motion.div className="users-toolbar" variants={reduce ? undefined : fadeUpSoft}>
                <div className="tab-bar" role="tablist" aria-label="Plan filters">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={status === tab.id}
                      className={status === tab.id ? "tab active" : "tab"}
                      onClick={() => setStatus(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="subscription-plan-grid"
                variants={reduce ? undefined : fadeUpSoft}
              >
                {plans.map((plan) => (
                  <article key={plan.id} className="card subscription-plan">
                    <div className="subscription-plan-top">
                      <h2 className="section-title">{plan.name}</h2>
                      <span
                        className={
                          plan.status === "published"
                            ? "chip chip-blue"
                            : "chip chip-quiet"
                        }
                      >
                        {planStatusLabel(plan.status)}
                      </span>
                    </div>
                    <p className="subscription-plan-price mono">
                      {formatCents(plan.priceCents, plan.currency)}
                      <span className="subscription-period">
                        {intervalLabel(plan.interval, plan.intervalCount)}
                      </span>
                    </p>
                    <p className="hint" style={{ marginTop: 8 }}>
                      {plan.blurb}
                    </p>
                    <p className="mono users-email">{plan.slug}</p>
                    <div className="users-actions" style={{ marginTop: "auto" }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(plan)}
                      >
                        Edit
                      </button>
                      {plan.status !== "published" ? (
                        <button
                          type="button"
                          className="btn btn-sm"
                          disabled={publishPlan.isPending}
                          onClick={() => void publish(plan.id)}
                        >
                          Publish
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={archivePlan.isPending}
                          onClick={() => void archive(plan.id)}
                        >
                          Archive
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDeleteTarget(plan)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </motion.div>
              {plans.length === 0 ? (
                <p className="hint">No plans in this filter.</p>
              ) : null}
            </>
          )}

          <ConfirmSheet
            open={formOpen}
            onClose={() => setFormOpen(false)}
            title={editing ? `Edit ${editing.name}` : "New plan"}
          >
            <label className="field" style={{ marginTop: 16 }}>
              <span className="label">Name</span>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </label>
            <label className="field">
              <span className="label">Slug</span>
              <input
                className="input"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              />
            </label>
            <label className="field">
              <span className="label">Blurb</span>
              <input
                className="input"
                value={form.blurb}
                onChange={(e) => setForm((prev) => ({ ...prev, blurb: e.target.value }))}
              />
            </label>
            <label className="field">
              <span className="label">Price</span>
              <input
                className="input"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              />
            </label>
            <label className="field">
              <span className="label">Interval</span>
              <select
                className="select"
                value={form.interval}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, interval: e.target.value as PlanInterval }))
                }
              >
                <option value="month">Month</option>
                <option value="year">Year</option>
                <option value="one_time">One-time</option>
                <option value="forever">Forever</option>
              </select>
            </label>
            <label className="field">
              <span className="label">Features</span>
              <textarea
                className="textarea"
                value={form.features}
                onChange={(e) => setForm((prev) => ({ ...prev, features: e.target.value }))}
              />
            </label>
            <div className="settings-actions" style={{ marginTop: 22 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setFormOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={createPlan.isPending || updatePlan.isPending}
                onClick={() => void save()}
              >
                Save
              </button>
            </div>
          </ConfirmSheet>

          <ConfirmSheet
            open={deleteTarget !== null}
            onClose={() => setDeleteTarget(null)}
            title={deleteTarget ? `Delete ${deleteTarget.name}?` : "Delete plan?"}
          >
            <p className="hint" style={{ marginTop: 10, lineHeight: 1.55 }}>
              Published plans should be archived first. Delete only if nothing
              still points at this catalog row.
            </p>
            <div className="settings-actions" style={{ marginTop: 22 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>
                Keep plan
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deletePlan.isPending}
                onClick={() => void remove()}
              >
                Delete
              </button>
            </div>
          </ConfirmSheet>
        </motion.div>
      </MotionConfig>
    </RoleGate>
  );
}

"use client";

import { useState } from "react";
import { Archive, Globe, Pencil, Repeat, Trash2 } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { RoleGate } from "@/components/app/role-gate";
import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { AdminListPageSkeleton } from "@/components/ui/page-skeletons";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { btn, btnDanger, btnGhost, btnPrimary, btnSm, dialogBtn } from "@/lib/ui";
import { cn } from "@/lib/utils";

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

const INTERVAL_OPTIONS: Array<{ value: PlanInterval; label: string; hint: string }> = [
  { value: "month", label: "Month", hint: "Billed monthly" },
  { value: "year", label: "Year", hint: "Billed yearly" },
  { value: "one_time", label: "One-time", hint: "Single charge" },
  { value: "forever", label: "Forever", hint: "No renewal" },
];

function tabClass(active: boolean) {
  return cn(
    "cursor-pointer rounded-full border px-4 py-2 text-[0.88rem] font-semibold transition-all",
    active
      ? "border-ink bg-ink text-paper"
      : "border-foreground/10 bg-muted/30 text-muted-foreground hover:-translate-y-px hover:border-foreground/20 hover:bg-card hover:text-foreground",
  );
}

function statusChipClass(status: PlanStatus) {
  return cn(
    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.07em]",
    status === "published"
      ? "border-blue bg-blue-soft text-blue-deep"
      : "border-foreground/10 text-muted-foreground",
  );
}

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
          className="min-w-0"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={reduce ? undefined : staggerContainer}
        >
          {plansQuery.isLoading ? (
            <AdminListPageSkeleton rows={6} tabs={4} withSearch={false} withAction />
          ) : (
            <>
              <motion.header
                className="mb-4 flex flex-wrap items-center justify-between gap-4"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div>
                  <p className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-blue">
                    Catalog
                  </p>
                  <h1 className="mb-1.5 font-heading text-2xl font-bold tracking-tight">
                    Plans
                  </h1>
                  <p className="mt-2.5 max-w-[46ch] text-[clamp(1rem,1.6vw,1.18rem)] text-muted-foreground">
                    Draft, publish, and archive the public pricing catalog.
                  </p>
                </div>
                <button
                  type="button"
                  className={cn(btn, btnPrimary, "min-h-12 min-w-[10.5rem] px-7")}
                  onClick={openCreate}
                >
                  New plan
                </button>
              </motion.header>

              <QueryError error={plansQuery.error} />

              <motion.div
                className="mb-[18px] flex flex-wrap items-end justify-between gap-4"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Plan filters">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={status === tab.id}
                      className={tabClass(status === tab.id)}
                      onClick={() => setStatus(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 items-stretch gap-[18px] md:grid-cols-2 xl:grid-cols-3"
                variants={reduce ? undefined : fadeUpSoft}
              >
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className="flex h-full flex-col gap-3 p-[18px]"
                  >
                    <div className="flex min-h-10 items-start justify-between gap-2.5">
                      <CardTitle className="line-clamp-2 min-w-0 flex-1 text-[1.15rem] leading-tight">
                        {plan.name}
                      </CardTitle>
                      <span className={statusChipClass(plan.status)}>
                        {planStatusLabel(plan.status)}
                      </span>
                    </div>
                    <p className="m-0 min-h-7 font-mono text-[1.45rem] font-bold tracking-tight tabular-nums">
                      {formatCents(plan.priceCents, plan.currency)}
                      <span className="ml-1 text-[0.82rem] font-semibold text-muted-foreground">
                        {intervalLabel(plan.interval, plan.intervalCount)}
                      </span>
                    </p>
                    <p className="m-0 min-h-[4.65em] flex-1 text-[0.8rem] leading-[1.55] text-muted-foreground">
                      {plan.blurb}
                    </p>
                    <p className="m-0 mt-0.5 font-mono text-[0.72rem] text-muted-foreground">
                      {plan.slug}
                    </p>
                    <div className="mt-auto flex w-full flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        className={cn(btn, btnGhost, btnSm, "min-h-9 px-3.5")}
                        onClick={() => openEdit(plan)}
                      >
                        <Pencil size={14} strokeWidth={2.2} aria-hidden />
                        Edit
                      </button>
                      {plan.status !== "published" ? (
                        <button
                          type="button"
                          className={cn(btn, btnGhost, btnSm, "min-h-9 px-3.5")}
                          disabled={publishPlan.isPending}
                          onClick={() => void publish(plan.id)}
                        >
                          <Globe size={14} strokeWidth={2.2} aria-hidden />
                          Publish
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={cn(btn, btnGhost, btnSm, "min-h-9 px-3.5")}
                          disabled={archivePlan.isPending}
                          onClick={() => void archive(plan.id)}
                        >
                          <Archive size={14} strokeWidth={2.2} aria-hidden />
                          Archive
                        </button>
                      )}
                      <button
                        type="button"
                        className={cn(btn, btnDanger, btnSm, "min-h-9 px-3.5")}
                        aria-label={`Delete ${plan.name}`}
                        onClick={() => setDeleteTarget(plan)}
                      >
                        <Trash2 size={14} strokeWidth={2.2} aria-hidden />
                        Delete
                      </button>
                    </div>
                  </Card>
                ))}
              </motion.div>
              {plans.length === 0 ? (
                <p className="mt-1.5 text-[0.8rem] text-muted-foreground">
                  No plans in this filter.
                </p>
              ) : null}
            </>
          )}

          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? `Edit ${editing.name}` : "New plan"}
                </DialogTitle>
                <DialogDescription>
                  {editing
                    ? "Update the catalog copy, price, and feature list."
                    : "Add a catalog plan. One feature per line."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid max-h-[min(70vh,36rem)] gap-4 overflow-y-auto pr-0.5">
                <div className="grid gap-2">
                  <Label htmlFor="plan-name">Name</Label>
                  <Input
                    id="plan-name"
                    placeholder="Pro"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="plan-slug">Slug</Label>
                  <Input
                    id="plan-slug"
                    placeholder="pro"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, slug: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="plan-blurb">Blurb</Label>
                  <Input
                    id="plan-blurb"
                    placeholder="For people who want the full chain."
                    value={form.blurb}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, blurb: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="plan-price">Price</Label>
                    <Input
                      id="plan-price"
                      inputMode="decimal"
                      placeholder="6.00"
                      value={form.price}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, price: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="plan-interval">Interval</Label>
                    <DropdownSelect
                      id="plan-interval"
                      value={form.interval}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          interval: value as PlanInterval,
                        }))
                      }
                      placeholder="Choose interval"
                      aria-label="Interval"
                      icon={Repeat}
                      options={INTERVAL_OPTIONS}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="plan-features">Features</Label>
                  <Textarea
                    id="plan-features"
                    placeholder={"Unlimited habits\nYear heatmap"}
                    value={form.features}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, features: e.target.value }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  className={cn(dialogBtn, btnGhost)}
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={cn(dialogBtn, btnPrimary)}
                  disabled={createPlan.isPending || updatePlan.isPending}
                  onClick={() => void save()}
                >
                  Save
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {deleteTarget ? `Delete ${deleteTarget.name}?` : "Delete plan?"}
                </DialogTitle>
                <DialogDescription className="leading-relaxed">
                  Published plans should be archived first. Delete only if nothing
                  still points at this catalog row.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <button
                  type="button"
                  className={cn(dialogBtn, btnGhost)}
                  onClick={() => setDeleteTarget(null)}
                >
                  Keep plan
                </button>
                <button
                  type="button"
                  className={cn(dialogBtn, btnDanger)}
                  disabled={deletePlan.isPending}
                  onClick={() => void remove()}
                >
                  Delete
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </MotionConfig>
    </RoleGate>
  );
}

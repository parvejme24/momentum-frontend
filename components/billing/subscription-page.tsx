"use client";

import { Suspense, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import {
  canDownloadInvoice,
  downloadCustomerInvoice,
} from "@/components/billing/download-invoice";
import { PlanFeatureList } from "@/components/billing/plan-feature-list";
import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { ConfirmSheet } from "@/components/settings/confirm-sheet";
import { SubscriptionPageSkeleton } from "@/components/ui/page-skeletons";
import { QueryError } from "@/components/ui/query-error";
import {
  mutationErrorMessage,
  paymentStatusChip,
  paymentStatusLabel,
  subscriptionStatusChip,
  subscriptionStatusLabel,
} from "@/lib/admin/map";
import {
  useBillingConfig,
  useBillingPortal,
  useCancelSubscription,
  useCheckout,
  useEntitlements,
  useMyInvoices,
  useMySubscription,
  usePlanCompare,
  usePublicPlans,
} from "@/lib/billing/hooks";
import type { CustomerInvoice, PublicPlan } from "@/lib/api/types";
import { checkoutAvailable, openCheckoutWindow } from "@/lib/billing/checkout";
import { billingKeys } from "@/lib/billing/keys";
import { useAuth } from "@/lib/auth/context";
import { hasAdminComplimentaryAccess } from "@/lib/auth/role";
import { formatPrettyIso } from "@/lib/dates";
import { formatCents, intervalLabel } from "@/lib/money";
import { planFeaturesForDisplay } from "@/lib/pricing/features";

function originUrl(path: string) {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

function SubscriptionBody() {
  const reduce = useReducedMotion();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const adminComplimentary = hasAdminComplimentaryAccess(user);

  useEffect(() => {
    function onBillingUpdated(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "momentum:billing-updated") return;
      void Promise.all([
        queryClient.refetchQueries({ queryKey: billingKeys.subscription() }),
        queryClient.refetchQueries({ queryKey: billingKeys.entitlements() }),
        queryClient.refetchQueries({ queryKey: billingKeys.invoices() }),
      ]);
    }

    window.addEventListener("message", onBillingUpdated);
    return () => window.removeEventListener("message", onBillingUpdated);
  }, [queryClient]);

  const plansQuery = usePublicPlans();
  const compareQuery = usePlanCompare();
  const billingConfigQuery = useBillingConfig();
  const entitlementsQuery = useEntitlements();
  const subQuery = useMySubscription();
  const invoicesQuery = useMyInvoices();
  const checkout = useCheckout();
  const portal = useBillingPortal();
  const cancelSub = useCancelSubscription();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const plans = plansQuery.data ?? [];
  const compare = compareQuery.data;
  const billingConfig = billingConfigQuery.data;
  const entitlements = entitlementsQuery.data;
  const subscription = subQuery.data ?? null;
  const invoices = (invoicesQuery.data ?? []).filter(
    (invoice) => invoice.amountCents > 0,
  );
  const currentPlanId = subscription?.plan.id;

  const busy =
    checkout.isPending ||
    portal.isPending ||
    cancelSub.isPending ||
    subQuery.isFetching;

  async function choosePlan(plan: PublicPlan) {
    if (
      plan.id === currentPlanId &&
      subscription &&
      ["active", "trialing"].includes(subscription.status)
    ) {
      pushToast(`You’re already on ${plan.name}`);
      return;
    }

    if (plan.priceCents > 0) {
      const tab = openCheckoutWindow(plan.id);
      if (!tab) {
        pushToast("Allow pop-ups to open checkout.");
      }
      return;
    }

    try {
      const result = await checkout.mutateAsync({ planId: plan.id });
      if (result.url) {
        window.location.assign(result.url);
        return;
      }
      pushToast("Moved to Free");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not change plan"));
    }
  }

  async function openPortal() {
    try {
      const result = await portal.mutateAsync(originUrl("/subscription"));
      window.location.assign(result.url);
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not open billing portal"));
    }
  }

  async function confirmCancel() {
    try {
      await cancelSub.mutateAsync(true);
      setCancelOpen(false);
      pushToast("Cancellation scheduled at period end");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not cancel"));
    }
  }

  async function handleDownload(invoice: CustomerInvoice) {
    if (!canDownloadInvoice(invoice)) {
      pushToast("Download unavailable for this invoice");
      return;
    }

    setDownloadingId(invoice.id);
    try {
      await downloadCustomerInvoice(invoice, {
        name: user?.name?.trim() || "Momentum member",
        email: user?.email?.trim() || "",
      });
      pushToast("Downloaded invoice PDF");
    } catch {
      pushToast("Couldn’t download the PDF. Try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  const loading =
    plansQuery.isLoading ||
    subQuery.isLoading ||
    invoicesQuery.isLoading ||
    entitlementsQuery.isLoading;
  const paidLive =
    Boolean(subscription) &&
    subscription!.plan.priceCents > 0 &&
    ["active", "trialing", "past_due"].includes(subscription!.status);
  const paidCheckoutReady = checkoutAvailable(billingConfig);
  const stripeConfigured = billingConfig?.stripe.configured ?? false;

  const habitLimitLabel =
    entitlements?.maxHabits == null
      ? "Unlimited"
      : String(entitlements.maxHabits);
  const entitlementsExpires = entitlements?.isLifetime
    ? "Lifetime"
    : entitlements?.expiresAt
      ? formatPrettyIso(entitlements.expiresAt)
      : "—";

  const renewsOn = subscription?.currentPeriodEnd
    ? formatPrettyIso(subscription.currentPeriodEnd)
    : adminComplimentary && subscription
      ? "Never"
      : "—";

  return (
    <>
      {loading ? (
        <SubscriptionPageSkeleton />
      ) : (
        <MotionConfig reducedMotion="user">
          <motion.div
            className="subscription-page"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={reduce ? undefined : staggerContainer}
          >
            <motion.header
              className="page-head"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <p className="eyebrow">Billing</p>
              <h1>Subscription</h1>
              <p className="lede" style={{ marginTop: 10, maxWidth: "48ch" }}>
                One plan, one renewal date — keep the year chain without surprise
                invoices.
              </p>
            </motion.header>

            {adminComplimentary ? (
              <motion.p
                className="auth-alert"
                style={{ marginBottom: 0 }}
                variants={reduce ? undefined : fadeUpSoft}
              >
                Admin accounts include complimentary Pro access with no renewal
                date — track your own habits with full features.
              </motion.p>
            ) : null}

            <QueryError
              error={
                plansQuery.error ||
                subQuery.error ||
                invoicesQuery.error ||
                entitlementsQuery.error
              }
            />

            {!paidCheckoutReady ? (
              <motion.p
                className="hint"
                style={{ marginBottom: 0 }}
                variants={reduce ? undefined : fadeUpSoft}
              >
                Paid checkout is not configured on this environment yet. Free plan
                changes still work.
              </motion.p>
            ) : null}

            <motion.section
              className="card subscription-current"
              aria-labelledby="current-plan-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="panel-head">
                <div>
                  <h2 id="current-plan-heading" className="section-title">
                    Current plan
                  </h2>
                  <p className="hint" style={{ marginTop: 4 }}>
                    {subscription
                      ? subscription.cancelAtPeriodEnd
                        ? `Cancels on ${renewsOn}`
                        : `${subscriptionStatusLabel(subscription.status)}`
                      : "No paid plan yet"}
                  </p>
                </div>
                {subscription ? (
                  <span className={subscriptionStatusChip(subscription.status)}>
                    {subscription.plan.name}
                  </span>
                ) : (
                  <span className="chip chip-quiet">Free</span>
                )}
              </div>

              <div className="subscription-current-grid">
                <div>
                  <div className="stat-k">Price</div>
                  <div className="subscription-price mono">
                    {subscription
                      ? formatCents(
                          subscription.plan.priceCents,
                          subscription.plan.currency,
                        )
                      : "$0"}
                    <span className="subscription-period">
                      {subscription
                        ? intervalLabel(
                            subscription.plan.interval,
                            subscription.plan.intervalCount,
                          )
                        : "forever"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="stat-k">Renews</div>
                  <div className="mono subscription-meta-value">{renewsOn}</div>
                </div>
                <div>
                  <div className="stat-k">Seats</div>
                  <div className="mono subscription-meta-value">
                    {subscription?.seats ?? 1}
                  </div>
                </div>
                <div>
                  <div className="stat-k">Receipts to</div>
                  <div className="mono subscription-meta-value">
                    {user?.email ?? "—"}
                  </div>
                </div>
                {entitlements ? (
                  <>
                    <div>
                      <div className="stat-k">Tier</div>
                      <div className="mono subscription-meta-value">
                        {entitlements.tier === "pro" ? "Pro" : "Free"}
                      </div>
                    </div>
                    <div>
                      <div className="stat-k">Active habits</div>
                      <div className="mono subscription-meta-value">
                        {entitlements.activeHabits} / {habitLimitLabel}
                      </div>
                    </div>
                    <div>
                      <div className="stat-k">Access until</div>
                      <div className="mono subscription-meta-value">
                        {entitlementsExpires}
                      </div>
                    </div>
                    <div>
                      <div className="stat-k">AI suggestions</div>
                      <div className="mono subscription-meta-value">
                        {entitlements.aiEnabled ? "Included" : "—"}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {!adminComplimentary && stripeConfigured ? (
                <div className="settings-actions" style={{ marginTop: 18 }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busy}
                    onClick={() => void openPortal()}
                  >
                    Update card
                  </button>
                  {paidLive ? (
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={busy || Boolean(subscription?.cancelAtPeriodEnd)}
                      onClick={() => setCancelOpen(true)}
                    >
                      Cancel plan
                    </button>
                  ) : null}
                </div>
              ) : !adminComplimentary && paidLive ? (
                <div className="settings-actions" style={{ marginTop: 18 }}>
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={busy || Boolean(subscription?.cancelAtPeriodEnd)}
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancel plan
                  </button>
                </div>
              ) : null}
            </motion.section>

            {!adminComplimentary ? (
              <motion.section
                className="subscription-plans"
                aria-labelledby="plans-heading"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div
                  className="panel-head"
                  style={{ borderBottom: 0, marginBottom: 14, paddingBottom: 0 }}
                >
                  <h2 id="plans-heading" className="section-title">
                    Plans
                  </h2>
                </div>
                <div className="subscription-plan-grid">
                  {plans.map((plan) => {
                    const selected = plan.id === currentPlanId;
                    return (
                      <article
                        key={plan.id}
                        className={
                          selected
                            ? "card subscription-plan selected"
                            : plan.highlighted
                              ? "card subscription-plan featured"
                              : "card subscription-plan"
                        }
                      >
                        <div className="subscription-plan-top">
                          <h3 className="section-title">{plan.name}</h3>
                          {selected ? (
                            <span className="chip chip-blue">Current</span>
                          ) : plan.highlighted ? (
                            <span className="chip chip-flame">Popular</span>
                          ) : null}
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
                        <PlanFeatureList
                          features={planFeaturesForDisplay(plan, compare)}
                        />
                        <button
                          type="button"
                          className={
                            selected
                              ? "btn btn-ghost btn-block"
                              : plan.highlighted
                                ? "btn btn-primary btn-block"
                                : "btn btn-block"
                          }
                          disabled={
                            busy ||
                            selected ||
                            (plan.priceCents > 0 && !paidCheckoutReady)
                          }
                          onClick={() => void choosePlan(plan)}
                        >
                          {selected
                            ? "Current plan"
                            : plan.priceCents === 0
                              ? "Downgrade to Free"
                              : plan.ctaLabel}
                        </button>
                      </article>
                    );
                  })}
                </div>
                {plans.length === 0 ? (
                  <p className="hint">No published plans yet.</p>
                ) : null}
              </motion.section>
            ) : null}

            <motion.section
              className="card"
              aria-labelledby="invoices-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="panel-head">
                <h2 id="invoices-heading" className="section-title">
                  Invoices
                </h2>
              </div>
              {invoices.length === 0 ? (
                <p className="hint">No invoices yet.</p>
              ) : (
                <ul className="invoice-list">
                  {invoices.map((invoice) => {
                    const downloadable = canDownloadInvoice(invoice);
                    const downloading = downloadingId === invoice.id;
                    return (
                      <li key={invoice.id} className="invoice-row">
                        <div className="invoice-copy">
                          <div className="invoice-label">
                            {invoice.description || "Momentum plan"}
                          </div>
                          <div className="invoice-date mono">
                            {formatPrettyIso(invoice.paidAt)}
                          </div>
                        </div>
                        <span className="mono invoice-amount">
                          {formatCents(invoice.amountCents, invoice.currency)}
                        </span>
                        <span className={paymentStatusChip(invoice.status)}>
                          {paymentStatusLabel(invoice.status)}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm invoice-download"
                          disabled={!downloadable || downloading}
                          aria-busy={downloading}
                          title={
                            downloadable
                              ? "Download PDF invoice"
                              : invoice.amountCents <= 0
                                ? "No charge on this invoice"
                                : "Download unavailable for failed payments"
                          }
                          onClick={() => void handleDownload(invoice)}
                        >
                          <Download size={14} strokeWidth={2.4} aria-hidden />
                          {downloading ? "Generating…" : "Download PDF"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.section>

            <ConfirmSheet
              open={cancelOpen}
              onClose={() => setCancelOpen(false)}
              title={`Cancel ${subscription?.plan.name ?? "plan"}?`}
            >
              <p className="hint" style={{ marginTop: 10, lineHeight: 1.55 }}>
                You keep access until {renewsOn}. After that the year chain stays
                on Free until you upgrade again.
              </p>
              <div className="settings-actions" style={{ marginTop: 22 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setCancelOpen(false)}
                >
                  Keep plan
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={busy}
                  onClick={() => void confirmCancel()}
                >
                  Cancel plan
                </button>
              </div>
            </ConfirmSheet>
          </motion.div>
        </MotionConfig>
      )}
    </>
  );
}

export function SubscriptionPage() {
  return (
    <Suspense fallback={<SubscriptionPageSkeleton />}>
      <SubscriptionBody />
    </Suspense>
  );
}

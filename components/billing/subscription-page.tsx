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
import {
  btn,
  btnBlock,
  btnDanger,
  btnGhost,
  btnPrimary,
  btnSm,
  card,
  chip,
  chipBlue,
  chipFlame,
  chipQuiet,
  eyebrow,
  hint,
  lede,
  mono,
  pageHead,
  panelHead,
  sectionTitle,
  settingsActions,
  statK,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

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
            className="min-w-0"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={reduce ? undefined : staggerContainer}
          >
            <motion.header
              className={pageHead}
              variants={reduce ? undefined : fadeUpSoft}
            >
              <p className={cn(eyebrow, "mb-2")}>Billing</p>
              <h1>Subscription</h1>
              <p className={cn(lede, "mt-2.5 max-w-[48ch]")}>
                One plan, one renewal date — keep the year chain without surprise
                invoices.
              </p>
            </motion.header>

            {adminComplimentary ? (
              <motion.p
                className="mb-0 rounded-md border border-[var(--stroke)] bg-flame-soft px-3.5 py-3 text-[0.9rem] font-semibold text-danger-ink dark:border-[rgba(201,122,106,0.35)] dark:bg-[color-mix(in_srgb,#c97a6a_16%,var(--paper-raised))] dark:text-[#e8a598]"
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
                className={cn(hint, "mb-0")}
                variants={reduce ? undefined : fadeUpSoft}
              >
                Paid checkout is not configured on this environment yet. Free plan
                changes still work.
              </motion.p>
            ) : null}

            <motion.section
              className={cn(card, "mb-[22px]")}
              aria-labelledby="current-plan-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className={panelHead}>
                <div>
                  <h2 id="current-plan-heading" className={sectionTitle}>
                    Current plan
                  </h2>
                  <p className={cn(hint, "mt-1")}>
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
                  <span className={cn(chip, chipQuiet)}>Free</span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-[18px] nav:grid-cols-2 wide:grid-cols-4">
                <div>
                  <div className={statK}>Price</div>
                  <div
                    className={cn(
                      mono,
                      "mt-1.5 text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.05em]",
                    )}
                  >
                    {subscription
                      ? formatCents(
                          subscription.plan.priceCents,
                          subscription.plan.currency,
                        )
                      : "$0"}
                    <span className="ml-1 text-[0.82rem] font-semibold text-ink-50">
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
                  <div className={statK}>Renews</div>
                  <div className={cn(mono, "mt-1.5 text-[0.88rem] font-semibold text-ink-70")}>
                    {renewsOn}
                  </div>
                </div>
                <div>
                  <div className={statK}>Seats</div>
                  <div className={cn(mono, "mt-1.5 text-[0.88rem] font-semibold text-ink-70")}>
                    {subscription?.seats ?? 1}
                  </div>
                </div>
                <div>
                  <div className={statK}>Receipts to</div>
                  <div className={cn(mono, "mt-1.5 text-[0.88rem] font-semibold text-ink-70")}>
                    {user?.email ?? "—"}
                  </div>
                </div>
                {entitlements ? (
                  <>
                    <div>
                      <div className={statK}>Tier</div>
                      <div className={cn(mono, "mt-1.5 text-[0.88rem] font-semibold text-ink-70")}>
                        {entitlements.tier === "pro" ? "Pro" : "Free"}
                      </div>
                    </div>
                    <div>
                      <div className={statK}>Active habits</div>
                      <div className={cn(mono, "mt-1.5 text-[0.88rem] font-semibold text-ink-70")}>
                        {entitlements.activeHabits} / {habitLimitLabel}
                      </div>
                    </div>
                    <div>
                      <div className={statK}>Access until</div>
                      <div className={cn(mono, "mt-1.5 text-[0.88rem] font-semibold text-ink-70")}>
                        {entitlementsExpires}
                      </div>
                    </div>
                    <div>
                      <div className={statK}>AI suggestions</div>
                      <div className={cn(mono, "mt-1.5 text-[0.88rem] font-semibold text-ink-70")}>
                        {entitlements.aiEnabled ? "Included" : "—"}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {!adminComplimentary && stripeConfigured ? (
                <div className={cn(settingsActions, "mt-[18px]")}>
                  <button
                    type="button"
                    className={cn(btn, btnGhost)}
                    disabled={busy}
                    onClick={() => void openPortal()}
                  >
                    Update card
                  </button>
                  {paidLive ? (
                    <button
                      type="button"
                      className={cn(btn, btnDanger)}
                      disabled={busy || Boolean(subscription?.cancelAtPeriodEnd)}
                      onClick={() => setCancelOpen(true)}
                    >
                      Cancel plan
                    </button>
                  ) : null}
                </div>
              ) : !adminComplimentary && paidLive ? (
                <div className={cn(settingsActions, "mt-[18px]")}>
                  <button
                    type="button"
                    className={cn(btn, btnDanger)}
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
                className="mb-[22px]"
                aria-labelledby="plans-heading"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div className={cn(panelHead, "mb-3.5 border-b-0 pb-0")}>
                  <h2 id="plans-heading" className={sectionTitle}>
                    Plans
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-[18px] wide:grid-cols-3">
                  {plans.map((plan) => {
                    const selected = plan.id === currentPlanId;
                    return (
                      <article
                        key={plan.id}
                        className={cn(
                          card,
                          "flex flex-col gap-3 p-[18px]",
                          selected &&
                            "border-blue shadow-[var(--shadow-lift),var(--focus-ring)]",
                          !selected && plan.highlighted && "shadow-lift",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          <h3 className={sectionTitle}>{plan.name}</h3>
                          {selected ? (
                            <span className={cn(chip, chipBlue)}>Current</span>
                          ) : plan.highlighted ? (
                            <span className={cn(chip, chipFlame)}>Popular</span>
                          ) : null}
                        </div>
                        <p className={cn(mono, "text-[1.45rem] font-bold tracking-[-0.04em]")}>
                          {formatCents(plan.priceCents, plan.currency)}
                          <span className="ml-1 text-[0.82rem] font-semibold text-ink-50">
                            {intervalLabel(plan.interval, plan.intervalCount)}
                          </span>
                        </p>
                        <p className={cn(hint, "mt-2")}>
                          {plan.blurb}
                        </p>
                        <PlanFeatureList
                          features={planFeaturesForDisplay(plan, compare)}
                        />
                        <button
                          type="button"
                          className={cn(
                            btn,
                            btnBlock,
                            selected
                              ? btnGhost
                              : plan.highlighted
                                ? btnPrimary
                                : null,
                          )}
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
                  <p className={hint}>No published plans yet.</p>
                ) : null}
              </motion.section>
            ) : null}

            <motion.section
              className={card}
              aria-labelledby="invoices-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className={panelHead}>
                <h2 id="invoices-heading" className={sectionTitle}>
                  Invoices
                </h2>
              </div>
              {invoices.length === 0 ? (
                <p className={hint}>No invoices yet.</p>
              ) : (
                <ul className="m-0 grid list-none p-0">
                  {invoices.map((invoice) => {
                    const downloadable = canDownloadInvoice(invoice);
                    const downloading = downloadingId === invoice.id;
                    return (
                      <li
                        key={invoice.id}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-ink/8 py-3 first:pt-0 last:border-b-0 last:pb-0 nav:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
                      >
                        <div className="min-w-0">
                          <div className="font-bold tracking-[-0.01em]">
                            {invoice.description || "Momentum plan"}
                          </div>
                          <div className={cn(mono, "mt-[3px] text-[0.72rem] text-ink-50")}>
                            {formatPrettyIso(invoice.paidAt)}
                          </div>
                        </div>
                        <span className={cn(mono, "font-bold max-nav:col-start-1")}>
                          {formatCents(invoice.amountCents, invoice.currency)}
                        </span>
                        <span
                          className={cn(
                            paymentStatusChip(invoice.status),
                            "max-nav:col-start-2 max-nav:row-span-2 max-nav:self-center",
                          )}
                        >
                          {paymentStatusLabel(invoice.status)}
                        </span>
                        <button
                          type="button"
                          className={cn(
                            btn,
                            btnGhost,
                            btnSm,
                            "shrink-0 whitespace-nowrap max-nav:col-span-full max-nav:w-full",
                          )}
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
              <p className={cn(hint, "mt-2.5 leading-[1.55]")}>
                You keep access until {renewsOn}. After that the year chain stays
                on Free until you upgrade again.
              </p>
              <div className={cn(settingsActions, "mt-[22px]")}>
                <button
                  type="button"
                  className={cn(btn, btnGhost)}
                  onClick={() => setCancelOpen(false)}
                >
                  Keep plan
                </button>
                <button
                  type="button"
                  className={cn(btn, btnDanger)}
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

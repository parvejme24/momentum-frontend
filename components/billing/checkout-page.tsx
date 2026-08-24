"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CreditCard, Landmark, ShieldCheck, X } from "lucide-react";
import { motion } from "framer-motion";

import { CheckoutShell } from "@/components/billing/checkout-shell";
import { PlanFeatureList } from "@/components/billing/plan-feature-list";
import { useToast } from "@/components/auth/toast";
import { QueryError } from "@/components/ui/query-error";
import { mutationErrorMessage } from "@/lib/admin/map";
import type { PaymentProvider } from "@/lib/api/types";
import {
  checkoutAvailable,
  checkoutRedirectUrls,
} from "@/lib/billing/checkout";
import {
  useBillingConfig,
  useCheckout,
  usePlanCompare,
  usePublicPlans,
} from "@/lib/billing/hooks";
import { useAuth } from "@/lib/auth/context";
import { formatCents, intervalLabel } from "@/lib/money";
import { planFeaturesForDisplay } from "@/lib/pricing/features";

function originUrl() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

function closeCheckout(router: ReturnType<typeof useRouter>) {
  if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
    window.close();
    return;
  }
  router.push("/subscription");
}

function CheckoutLoading() {
  return (
    <div className="checkout-desk checkout-desk-loading" aria-busy="true">
      <aside className="checkout-art" aria-hidden>
        <div className="skeleton skeleton-brand" />
        <div className="skeleton skeleton-section-title" />
        <div className="skeleton skeleton-lede" />
      </aside>
      <main className="checkout-main">
        <div className="checkout-main-inner">
          <div className="skeleton skeleton-section-title" />
          <div className="checkout-pay-stack">
            <div className="card checkout-pay-option page-skeleton-detail-card" />
            <div className="card checkout-pay-option page-skeleton-detail-card" />
          </div>
        </div>
      </main>
    </div>
  );
}

function CheckoutBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pushToast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const planId = searchParams.get("plan");

  const plansQuery = usePublicPlans();
  const compareQuery = usePlanCompare();
  const billingConfigQuery = useBillingConfig();
  const checkout = useCheckout();

  const plans = plansQuery.data ?? [];
  const compare = compareQuery.data;
  const billingConfig = billingConfigQuery.data;

  const plan = useMemo(
    () => plans.find((item) => item.id === planId) ?? null,
    [plans, planId],
  );

  const stripeReady = billingConfig?.stripe.configured ?? false;
  const sslReady = billingConfig?.sslcommerz.configured ?? false;
  const paidCheckoutReady = checkoutAvailable(billingConfig);

  useEffect(() => {
    if (authLoading || user) return;
    const next = encodeURIComponent(
      `${window.location.pathname}${window.location.search}`,
    );
    router.replace(`/login?next=${next}`);
  }, [authLoading, user, router]);

  async function startPayment(provider: PaymentProvider) {
    if (!plan || !user) return;
    try {
      const origin = originUrl();
      const redirects = checkoutRedirectUrls(provider, origin, billingConfig);
      const result = await checkout.mutateAsync({
        planId: plan.id,
        provider,
        successUrl: redirects.successUrl,
        cancelUrl: redirects.cancelUrl,
      });
      if (result.url) {
        window.location.assign(result.url);
        return;
      }
      pushToast(`Switched to ${plan.name}`);
      router.replace("/subscription");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not start checkout"));
    }
  }

  const loading =
    authLoading ||
    plansQuery.isLoading ||
    billingConfigQuery.isLoading ||
    compareQuery.isLoading;

  if (loading) {
    return <CheckoutLoading />;
  }

  if (!planId || !plan) {
    return (
      <CheckoutShell
        art={{
          eyebrow: "Checkout",
          title: "Plan not found",
          body: "Pick a plan from your subscription page first.",
          price: "—",
          period: "",
        }}
      >
        <Link href="/subscription" className="btn btn-primary">
          Back to subscription
        </Link>
      </CheckoutShell>
    );
  }

  if (plan.priceCents === 0) {
    return (
      <CheckoutShell
        art={{
          eyebrow: "Checkout",
          title: "Free plan",
          body: "Downgrade from your subscription page instead.",
          price: "$0",
          period: "forever",
        }}
      >
        <Link href="/subscription" className="btn btn-primary">
          Back to subscription
        </Link>
      </CheckoutShell>
    );
  }

  const features = planFeaturesForDisplay(plan, compare);

  return (
    <CheckoutShell
      art={{
        eyebrow: "Your order",
        title: plan.name,
        body: plan.blurb,
        price: formatCents(plan.priceCents, plan.currency),
        period: intervalLabel(plan.interval, plan.intervalCount),
        footer: (
          <ul className="checkout-trust-list">
            <li>
              <ShieldCheck size={15} strokeWidth={2.2} aria-hidden />
              Secure payment on Stripe or SSLCommerz
            </li>
            <li>
              <Check size={15} strokeWidth={2.2} aria-hidden />
              Plan activates right after payment
            </li>
          </ul>
        ),
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="checkout-main-head">
          <div>
            <p className="checkout-main-eyebrow">Payment</p>
            <h2 className="checkout-main-title">Choose how to pay</h2>
            <p className="hint checkout-main-lede">
              You&apos;ll finish on a secure gateway page. When payment succeeds,
              your subscription tab updates automatically.
            </p>
          </div>
          <button
            type="button"
            className="btn-icon checkout-close"
            aria-label="Close checkout"
            onClick={() => closeCheckout(router)}
          >
            <X size={18} strokeWidth={2.4} aria-hidden />
          </button>
        </div>

        <QueryError
          error={
            plansQuery.error || billingConfigQuery.error || compareQuery.error
          }
        />

        <section className="checkout-features card card-flat" aria-label="Included">
          <p className="label">Included in {plan.name}</p>
          <PlanFeatureList features={features.slice(0, 5)} />
        </section>

        {!paidCheckoutReady ? (
          <p className="hint">Paid checkout is not configured yet.</p>
        ) : (
          <div className="checkout-pay-stack">
            {stripeReady ? (
              <article className="card checkout-pay-option checkout-pay-option-stripe">
                <div className="checkout-pay-option-head">
                  <div className="checkout-pay-icon checkout-pay-icon-stripe" aria-hidden>
                    <CreditCard size={20} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="section-title">Card · Stripe</h3>
                    <p className="hint checkout-pay-copy">
                      Visa, Mastercard, Amex — international cards and recurring
                      billing.
                    </p>
                  </div>
                </div>
                <ul className="checkout-pay-points">
                  <li>Hosted Stripe Checkout</li>
                  <li>Update card from Subscription anytime</li>
                </ul>
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  disabled={checkout.isPending || authLoading || !user}
                  onClick={() => void startPayment("stripe")}
                >
                  Continue with Stripe
                </button>
              </article>
            ) : null}

            {sslReady ? (
              <article className="card checkout-pay-option checkout-pay-option-ssl">
                <div className="checkout-pay-option-head">
                  <div className="checkout-pay-icon checkout-pay-icon-ssl" aria-hidden>
                    <Landmark size={20} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="section-title">SSLCommerz</h3>
                    <p className="hint checkout-pay-copy">
                      bKash, Nagad, local bank cards, and mobile banking in
                      Bangladesh.
                    </p>
                  </div>
                </div>
                <ul className="checkout-pay-points">
                  <li>Local wallets and bank transfer</li>
                  <li>Instant activation after payment</li>
                </ul>
                {billingConfig?.sslcommerz.sandbox ? (
                  <p className="hint checkout-pay-note">
                    Sandbox — use SSLCommerz test credentials.
                  </p>
                ) : null}
                <button
                  type="button"
                  className="btn btn-block"
                  disabled={checkout.isPending || authLoading || !user}
                  onClick={() => void startPayment("sslcommerz")}
                >
                  Continue with SSLCommerz
                </button>
              </article>
            ) : null}
          </div>
        )}

        <p className="hint checkout-footnote mono">
          <button
            type="button"
            className="auth-inline-link"
            onClick={() => closeCheckout(router)}
          >
            Cancel and return to subscription
          </button>
        </p>
      </motion.div>
    </CheckoutShell>
  );
}

export function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutBody />
    </Suspense>
  );
}

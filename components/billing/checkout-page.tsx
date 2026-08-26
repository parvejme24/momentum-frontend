"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, CreditCard, Landmark, ShieldCheck, X } from "lucide-react";
import { easeOut } from "@/components/home/motion";

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
import {
  btn,
  btnBlock,
  btnIcon,
  btnPrimary,
  card,
  cardFlat,
  hint,
  inlineLink,
  label,
  mono,
  sectionTitle,
  skeleton,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

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
    <div
      className="pointer-events-none relative grid min-h-screen grid-cols-1 bg-paper wide:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"
      aria-busy="true"
    >
      <aside
        className="flex flex-col justify-between gap-7 border-r border-[var(--stroke)] bg-[linear-gradient(165deg,color-mix(in_srgb,var(--blue-soft)_88%,var(--paper))_0%,var(--paper-raised)_55%,var(--paper)_100%)] p-[clamp(24px,4vw,48px)] max-wide:border-r-0 max-wide:border-b"
        aria-hidden
      >
        <div className={cn(skeleton, "h-[1.4rem] w-[8.5rem]")} />
        <div className={cn(skeleton, "mb-3.5 h-4 w-36")} />
        <div className={cn(skeleton, "mt-3 h-[0.88rem] w-[min(28rem,92%)]")} />
      </aside>
      <main className="flex items-center justify-center p-[clamp(20px,4vw,40px)] max-wide:items-start">
        <div className="w-[min(100%,520px)]">
          <div className={cn(skeleton, "mb-3.5 h-4 w-36")} />
          <div className="grid gap-3.5">
            <div className={cn(card, "mt-6 min-h-32")} />
            <div className={cn(card, "mt-6 min-h-32")} />
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
        <Link href="/subscription" className={cn(btn, btnPrimary)}>
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
        <Link href="/subscription" className={cn(btn, btnPrimary)}>
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
          <ul className="m-0 grid list-none gap-2.5 p-0 text-[0.88rem] text-ink-70 [&_li]:flex [&_li]:items-center [&_li]:gap-2 [&_svg]:shrink-0 [&_svg]:text-blue">
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
        transition={{ duration: 0.48, ease: easeOut }}
      >
        <div className="mb-[18px] flex items-start justify-between gap-3">
          <div>
            <p className="m-0 font-mono text-[0.68rem] tracking-[0.12em] uppercase text-blue">
              Payment
            </p>
            <h2 className="mt-2 mb-0 font-heading text-[clamp(1.45rem,3vw,1.85rem)] font-extrabold tracking-[-0.03em]">
              Choose how to pay
            </h2>
            <p className={cn(hint, "mt-2 max-w-[42ch] leading-[1.55]")}>
              You&apos;ll finish on a secure gateway page. When payment succeeds,
              your subscription tab updates automatically.
            </p>
          </div>
          <button
            type="button"
            className={cn(btnIcon, "shrink-0")}
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

        <section
          className={cn(card, cardFlat, "mb-4 bg-paper-white px-[18px] py-4")}
          aria-label="Included"
        >
          <p className={label}>Included in {plan.name}</p>
          <PlanFeatureList features={features.slice(0, 5)} />
        </section>

        {!paidCheckoutReady ? (
          <p className={hint}>Paid checkout is not configured yet.</p>
        ) : (
          <div className="grid gap-3.5">
            {stripeReady ? (
              <article
                className={cn(
                  card,
                  "flex flex-col gap-3 border-blue p-[18px] shadow-[var(--shadow-lift),var(--focus-ring)] dark:bg-paper-raised dark:hover:-translate-y-[3px] dark:hover:border-[rgba(139,164,201,0.35)] dark:hover:shadow-[var(--shadow),var(--shadow-glow)]",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="grid size-[42px] shrink-0 place-items-center rounded-md border border-[var(--stroke)] bg-blue-soft text-blue-deep"
                    aria-hidden
                  >
                    <CreditCard size={20} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className={sectionTitle}>Card · Stripe</h3>
                    <p className={cn(hint, "mt-1 leading-normal")}>
                      Visa, Mastercard, Amex — international cards and recurring
                      billing.
                    </p>
                  </div>
                </div>
                <ul className="m-0 pl-[1.1rem] text-[0.86rem] leading-[1.45] text-ink-70 [&_li+li]:mt-1">
                  <li>Hosted Stripe Checkout</li>
                  <li>Update card from Subscription anytime</li>
                </ul>
                <button
                  type="button"
                  className={cn(btn, btnPrimary, btnBlock)}
                  disabled={checkout.isPending || authLoading || !user}
                  onClick={() => void startPayment("stripe")}
                >
                  Continue with Stripe
                </button>
              </article>
            ) : null}

            {sslReady ? (
              <article
                className={cn(
                  card,
                  "flex flex-col gap-3 p-[18px] shadow-paper-sm dark:bg-paper-raised dark:hover:-translate-y-[3px] dark:hover:border-[rgba(139,164,201,0.35)] dark:hover:shadow-[var(--shadow),var(--shadow-glow)]",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="grid size-[42px] shrink-0 place-items-center rounded-md border border-[var(--stroke)] bg-flame-soft text-danger-ink"
                    aria-hidden
                  >
                    <Landmark size={20} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className={sectionTitle}>SSLCommerz</h3>
                    <p className={cn(hint, "mt-1 leading-normal")}>
                      bKash, Nagad, local bank cards, and mobile banking in
                      Bangladesh.
                    </p>
                  </div>
                </div>
                <ul className="m-0 pl-[1.1rem] text-[0.86rem] leading-[1.45] text-ink-70 [&_li+li]:mt-1">
                  <li>Local wallets and bank transfer</li>
                  <li>Instant activation after payment</li>
                </ul>
                {billingConfig?.sslcommerz.sandbox ? (
                  <p className={cn(hint, "m-0 text-[0.78rem]")}>
                    Sandbox — use SSLCommerz test credentials.
                  </p>
                ) : null}
                <button
                  type="button"
                  className={cn(btn, btnBlock)}
                  disabled={checkout.isPending || authLoading || !user}
                  onClick={() => void startPayment("sslcommerz")}
                >
                  Continue with SSLCommerz
                </button>
              </article>
            ) : null}
          </div>
        )}

        <p className={cn(hint, mono, "mt-[18px] text-center")}>
          <button
            type="button"
            className={inlineLink}
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

import type { BillingConfig, PaymentProvider } from "@/lib/api/types";

export function checkoutAvailable(config: BillingConfig | undefined): boolean {
  return Boolean(
    config?.stripe.configured || config?.sslcommerz.configured,
  );
}

export function checkoutPath(planId: string) {
  return `/checkout?plan=${encodeURIComponent(planId)}`;
}

/** Where public pricing CTAs should go based on auth + plan. */
export function planPricingCtaHref(
  plan: { id: string; priceCents: number; ctaHref: string },
  isLoggedIn: boolean,
): string {
  if (!isLoggedIn) {
    return plan.ctaHref || "/register";
  }
  if (plan.priceCents > 0) {
    return checkoutPath(plan.id);
  }
  return "/dashboard";
}

export function openCheckoutWindow(planId: string) {
  if (typeof window === "undefined") return null;
  return window.open(
    checkoutPath(planId),
    "_blank",
    "noopener,noreferrer",
  );
}

/** Public payment return — must stay outside auth middleware. */
export const PAYMENT_RETURN_PATH = "/payment/return";

/** Clean URL after payment return handling finishes. */
export const POST_CHECKOUT_PATH = "/dashboard";

export function checkoutRedirectUrls(provider: PaymentProvider, origin: string) {
  const base = `${origin}${PAYMENT_RETURN_PATH}`;
  if (provider === "sslcommerz") {
    return {
      successUrl: `${base}?sslcommerz=success`,
      cancelUrl: `${base}?sslcommerz=cancel`,
      failUrl: `${base}?sslcommerz=fail`,
    };
  }

  return {
    successUrl: `${base}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${base}?checkout=cancel`,
    failUrl: `${base}?checkout=cancel`,
  };
}

export function paymentProviderLabel(provider: PaymentProvider): string {
  return provider === "sslcommerz" ? "SSLCommerz" : "Stripe";
}

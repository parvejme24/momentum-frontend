import { normalizeCustomerInvoice } from "@/components/billing/download-invoice";
import { api } from "@/lib/api/client";
import { billingPath } from "@/lib/api/config";
import type {
  BillingConfig,
  CheckoutInput,
  CheckoutResponse,
  ConfirmCheckoutInput,
  CustomerInvoice,
  CustomerSubscription,
  UserEntitlements,
} from "@/lib/api/types";

export async function getBillingConfig(): Promise<BillingConfig> {
  const raw = await api.get<BillingConfig>(billingPath("config"), {
    skipAuthRetry: true,
  });
  return normalizeBillingConfig(raw);
}

function normalizeBillingConfig(raw: BillingConfig): BillingConfig {
  const stripeConfigured =
    raw.stripe?.configured ?? (raw.configured && Boolean(raw.publishableKey));
  const publishableKey =
    raw.stripe?.publishableKey ?? raw.publishableKey ?? "";

  return {
    publishableKey,
    configured:
      raw.configured ??
      (stripeConfigured || Boolean(raw.sslcommerz?.configured)),
    stripe: raw.stripe ?? {
      publishableKey,
      configured: stripeConfigured,
    },
    sslcommerz: raw.sslcommerz ?? {
      configured: false,
      sandbox: true,
      successUrl: "",
      failUrl: "",
      cancelUrl: "",
    },
  };
}

export async function getEntitlements(): Promise<UserEntitlements> {
  const payload = await api.get<{ entitlements: UserEntitlements }>(
    billingPath("entitlements"),
  );
  return payload.entitlements;
}

export async function getMySubscription(): Promise<CustomerSubscription | null> {
  const payload = await api.get<{ subscription: CustomerSubscription | null }>(
    billingPath("subscription"),
  );
  return payload.subscription ?? null;
}

export async function listMyInvoices(): Promise<CustomerInvoice[]> {
  const payload = await api.get<{ invoices: CustomerInvoice[] }>(
    billingPath("invoices"),
  );
  if (!Array.isArray(payload.invoices)) return [];
  return payload.invoices.map(normalizeCustomerInvoice);
}

export async function startCheckout(
  body: CheckoutInput,
): Promise<CheckoutResponse> {
  return api.post<CheckoutResponse>(
    billingPath("checkout"),
    body as Record<string, unknown>,
  );
}

export async function confirmCheckout(
  input: ConfirmCheckoutInput,
): Promise<CustomerSubscription> {
  const payload = await api.post<{ subscription: CustomerSubscription }>(
    billingPath("confirm"),
    input as Record<string, unknown>,
  );
  return payload.subscription;
}

export async function openBillingPortal(
  returnUrl?: string,
): Promise<{ url: string }> {
  return api.post<{ url: string }>(
    billingPath("portal"),
    returnUrl ? { returnUrl } : {},
  );
}

export async function cancelMySubscription(
  atPeriodEnd = true,
): Promise<CustomerSubscription> {
  const payload = await api.post<{ subscription: CustomerSubscription }>(
    billingPath("cancel"),
    { atPeriodEnd },
  );
  return payload.subscription;
}

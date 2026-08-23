"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelMySubscription,
  confirmCheckout,
  getBillingConfig,
  getEntitlements,
  getMySubscription,
  listMyInvoices,
  openBillingPortal,
  startCheckout,
} from "@/lib/api/billing";
import {
  getPlanCompare,
  getPublicPlan,
  listPricingPackages,
  listPublicPlans,
} from "@/lib/api/pricing";
import type { CheckoutInput, ConfirmCheckoutInput } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";
import { billingKeys, pricingKeys } from "@/lib/billing/keys";

export function usePublicPlans() {
  return useQuery({
    queryKey: pricingKeys.public(),
    queryFn: listPublicPlans,
  });
}

export function usePricingPackages() {
  return useQuery({
    queryKey: pricingKeys.packages(),
    queryFn: listPricingPackages,
  });
}

export function usePublicPlan(slug: string) {
  return useQuery({
    queryKey: pricingKeys.plan(slug),
    queryFn: () => getPublicPlan(slug),
    enabled: Boolean(slug),
  });
}

export function usePlanCompare() {
  return useQuery({
    queryKey: pricingKeys.compare(),
    queryFn: getPlanCompare,
  });
}

export function useBillingConfig() {
  return useQuery({
    queryKey: billingKeys.config(),
    queryFn: getBillingConfig,
  });
}

export function useEntitlements() {
  const { user, isLoading } = useAuth();
  return useQuery({
    queryKey: billingKeys.entitlements(),
    queryFn: getEntitlements,
    enabled: !isLoading && Boolean(user),
  });
}

export function useMySubscription() {
  const { user, isLoading } = useAuth();
  return useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: getMySubscription,
    enabled: !isLoading && Boolean(user),
  });
}

export function useMyInvoices() {
  const { user, isLoading } = useAuth();
  return useQuery({
    queryKey: billingKeys.invoices(),
    queryFn: listMyInvoices,
    enabled: !isLoading && Boolean(user),
  });
}

function useInvalidateBilling() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.refetchQueries({ queryKey: billingKeys.subscription() }),
      queryClient.refetchQueries({ queryKey: billingKeys.entitlements() }),
      queryClient.refetchQueries({ queryKey: billingKeys.invoices() }),
      queryClient.invalidateQueries({ queryKey: billingKeys.all }),
    ]);
}

export function useCheckout() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: (body: CheckoutInput) => startCheckout(body),
    onSuccess: (result) => {
      if (result.subscription) void invalidate();
    },
  });
}

export function useConfirmCheckout() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: (input: ConfirmCheckoutInput) => confirmCheckout(input),
    onSuccess: () => invalidate(),
  });
}

export function useBillingPortal() {
  return useMutation({
    mutationFn: (returnUrl?: string) => openBillingPortal(returnUrl),
  });
}

export function useCancelSubscription() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: (atPeriodEnd: boolean) => cancelMySubscription(atPeriodEnd),
    onSuccess: () => invalidate(),
  });
}

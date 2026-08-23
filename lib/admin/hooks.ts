"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  banAdminUser,
  deleteAdminUser,
  getAdminUser,
  grantAdminUserAccess,
  listAdminUsers,
  restoreAdminUser,
  trashAdminUser,
  unbanAdminUser,
  updateAdminUser,
} from "@/lib/api/admin-users";
import {
  cancelAdminSubscription,
  createAdminSubscription,
  getAdminSubscription,
  listAdminSubscriptions,
  renewAdminSubscription,
  updateAdminSubscription,
} from "@/lib/api/admin-subscriptions";
import {
  createAdminPayment,
  getAdminPayment,
  getAdminRevenue,
  listAdminPayments,
  refundAdminPayment,
  updateAdminPayment,
} from "@/lib/api/admin-payments";
import {
  archiveAdminPlan,
  createAdminPlan,
  deleteAdminPlan,
  getAdminPlan,
  listAdminPlans,
  publishAdminPlan,
  reorderAdminPlans,
  updateAdminPlan,
} from "@/lib/api/pricing";
import type {
  BanUserInput,
  CreatePaymentInput,
  CreatePlanInput,
  CreateSubscriptionInput,
  GrantPlanAccessInput,
  ListAdminPaymentsQuery,
  ListAdminSubscriptionsQuery,
  ListAdminUsersQuery,
  RefundPaymentInput,
  RenewSubscriptionInput,
  RevenueQuery,
  UpdateAdminUserInput,
  UpdatePaymentInput,
  UpdatePlanInput,
  UpdateSubscriptionInput,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";
import { isAdmin } from "@/lib/auth/role";
import { adminKeys } from "@/lib/admin/keys";
import { ADMIN_LIVE_REFETCH_MS } from "@/lib/admin/live";

function useAdminEnabled() {
  const { user, isLoading } = useAuth();
  return !isLoading && isAdmin(user);
}

function useInvalidateAdmin() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adminKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all }),
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptions.all }),
      queryClient.invalidateQueries({ queryKey: adminKeys.payments.all }),
      queryClient.invalidateQueries({ queryKey: adminKeys.plans.all }),
    ]);
}

export function useAdminUsers(query: ListAdminUsersQuery = {}) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: adminKeys.users.list(query),
    queryFn: () => listAdminUsers(query),
    enabled,
  });
}

export function useAdminUser(id: string) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: adminKeys.users.detail(id),
    queryFn: () => getAdminUser(id),
    enabled: enabled && Boolean(id),
  });
}

export function useUpdateAdminUser(id: string) {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (body: UpdateAdminUserInput) => updateAdminUser(id, body),
    onSuccess: () => invalidate(),
  });
}

export function useBanAdminUser() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: BanUserInput }) =>
      banAdminUser(id, body),
    onSuccess: () => invalidate(),
  });
}

export function useUnbanAdminUser() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (id: string) => unbanAdminUser(id),
    onSuccess: () => invalidate(),
  });
}

export function useTrashAdminUser() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (id: string) => trashAdminUser(id),
    onSuccess: () => invalidate(),
  });
}

export function useRestoreAdminUser() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (id: string) => restoreAdminUser(id),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteAdminUser() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: () => invalidate(),
  });
}

export function useGrantAdminUserAccess() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: GrantPlanAccessInput }) =>
      grantAdminUserAccess(id, body),
    onSuccess: () => invalidate(),
  });
}

export function useAdminSubscriptions(
  query: ListAdminSubscriptionsQuery = {},
) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: adminKeys.subscriptions.list(query),
    queryFn: () => listAdminSubscriptions(query),
    enabled,
  });
}

export function useCreateAdminSubscription() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (body: CreateSubscriptionInput) =>
      createAdminSubscription(body),
    onSuccess: () => invalidate(),
  });
}

export function useAdminSubscription(id: string) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: adminKeys.subscriptions.detail(id),
    queryFn: () => getAdminSubscription(id),
    enabled: enabled && Boolean(id),
  });
}

export function useUpdateAdminSubscription() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateSubscriptionInput }) =>
      updateAdminSubscription(id, body),
    onSuccess: () => invalidate(),
  });
}

export function useCancelAdminSubscription() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({
      id,
      atPeriodEnd,
    }: {
      id: string;
      atPeriodEnd?: boolean;
    }) => cancelAdminSubscription(id, { atPeriodEnd }),
    onSuccess: () => invalidate(),
  });
}

export function useRenewAdminSubscription() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body?: RenewSubscriptionInput;
    }) => renewAdminSubscription(id, body),
    onSuccess: () => invalidate(),
  });
}

export function useAdminPayments(query: ListAdminPaymentsQuery = {}) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: adminKeys.payments.list(query),
    queryFn: () => listAdminPayments(query),
    enabled,
    refetchInterval: enabled ? ADMIN_LIVE_REFETCH_MS : false,
    refetchOnWindowFocus: true,
  });
}

export function useAdminPayment(id: string) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: adminKeys.payments.detail(id),
    queryFn: () => getAdminPayment(id),
    enabled: enabled && Boolean(id),
  });
}

export function useUpdateAdminPayment() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePaymentInput }) =>
      updateAdminPayment(id, body),
    onSuccess: () => invalidate(),
  });
}

export function useAdminRevenue(query: RevenueQuery = {}) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: adminKeys.payments.revenue(query),
    queryFn: () => getAdminRevenue(query),
    enabled,
    refetchInterval: enabled ? ADMIN_LIVE_REFETCH_MS : false,
    refetchOnWindowFocus: true,
  });
}

export function useCreateAdminPayment() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (body: CreatePaymentInput) => createAdminPayment(body),
    onSuccess: () => invalidate(),
  });
}

export function useRefundAdminPayment() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: RefundPaymentInput }) =>
      refundAdminPayment(id, body),
    onSuccess: () => invalidate(),
  });
}

export function useAdminPlans(
  status: "draft" | "published" | "archived" | "all" = "all",
) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: adminKeys.plans.list(status),
    queryFn: () => listAdminPlans(status),
    enabled,
  });
}

export function useAdminPlan(id: string) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: adminKeys.plans.detail(id),
    queryFn: () => getAdminPlan(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateAdminPlan() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (body: CreatePlanInput) => createAdminPlan(body),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateAdminPlan() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePlanInput }) =>
      updateAdminPlan(id, body),
    onSuccess: () => invalidate(),
  });
}

export function usePublishAdminPlan() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (id: string) => publishAdminPlan(id),
    onSuccess: () => invalidate(),
  });
}

export function useArchiveAdminPlan() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (id: string) => archiveAdminPlan(id),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteAdminPlan() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (id: string) => deleteAdminPlan(id),
    onSuccess: () => invalidate(),
  });
}

export function useReorderAdminPlans() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (ids: string[]) => reorderAdminPlans(ids),
    onSuccess: () => invalidate(),
  });
}

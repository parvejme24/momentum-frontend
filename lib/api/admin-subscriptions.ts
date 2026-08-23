import { api } from "@/lib/api/client";
import { adminSubscriptionsPath, queryString } from "@/lib/api/config";
import type {
  AdminSubscription,
  AdminSubscriptionListResponse,
  CancelSubscriptionInput,
  CreateSubscriptionInput,
  ListAdminSubscriptionsQuery,
  RenewSubscriptionInput,
  UpdateSubscriptionInput,
} from "@/lib/api/types";

function unwrap(
  payload: { subscription: AdminSubscription } | AdminSubscription,
): AdminSubscription {
  if (payload && typeof payload === "object" && "subscription" in payload) {
    return payload.subscription;
  }
  return payload as AdminSubscription;
}

export async function listAdminSubscriptions(
  query: ListAdminSubscriptionsQuery = {},
): Promise<AdminSubscriptionListResponse> {
  const payload = await api.get<AdminSubscriptionListResponse>(
    `${adminSubscriptionsPath()}${queryString(query)}`,
  );
  return {
    subscriptions: Array.isArray(payload.subscriptions)
      ? payload.subscriptions
      : [],
    page: payload.page ?? 1,
    limit: payload.limit ?? 20,
    total: payload.total ?? 0,
    pageCount: payload.pageCount ?? 0,
  };
}

export async function getAdminSubscription(
  id: string,
): Promise<AdminSubscription> {
  const payload = await api.get<{ subscription: AdminSubscription }>(
    adminSubscriptionsPath(id),
  );
  return unwrap(payload);
}

export async function createAdminSubscription(
  body: CreateSubscriptionInput,
): Promise<AdminSubscription> {
  const payload = await api.post<{ subscription: AdminSubscription }>(
    adminSubscriptionsPath(),
    body as Record<string, unknown>,
  );
  return unwrap(payload);
}

export async function updateAdminSubscription(
  id: string,
  body: UpdateSubscriptionInput,
): Promise<AdminSubscription> {
  const payload = await api.patch<{ subscription: AdminSubscription }>(
    adminSubscriptionsPath(id),
    body as Record<string, unknown>,
  );
  return unwrap(payload);
}

export async function cancelAdminSubscription(
  id: string,
  body: CancelSubscriptionInput = {},
): Promise<AdminSubscription> {
  const payload = await api.post<{ subscription: AdminSubscription }>(
    adminSubscriptionsPath(`${id}/cancel`),
    body as Record<string, unknown>,
  );
  return unwrap(payload);
}

export async function renewAdminSubscription(
  id: string,
  body: RenewSubscriptionInput = {},
): Promise<AdminSubscription> {
  const payload = await api.post<{ subscription: AdminSubscription }>(
    adminSubscriptionsPath(`${id}/renew`),
    body as Record<string, unknown>,
  );
  return unwrap(payload);
}

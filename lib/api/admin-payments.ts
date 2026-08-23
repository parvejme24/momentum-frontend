import { api } from "@/lib/api/client";
import {
  adminPaymentsPath,
  adminRevenuePath,
  queryString,
} from "@/lib/api/config";
import type {
  AdminPayment,
  AdminPaymentListResponse,
  CreatePaymentInput,
  ListAdminPaymentsQuery,
  RefundPaymentInput,
  RevenueQuery,
  RevenueResponse,
  UpdatePaymentInput,
} from "@/lib/api/types";

function unwrap(
  payload: { payment: AdminPayment } | AdminPayment,
): AdminPayment {
  if (payload && typeof payload === "object" && "payment" in payload) {
    return payload.payment;
  }
  return payload as AdminPayment;
}

export async function listAdminPayments(
  query: ListAdminPaymentsQuery = {},
): Promise<AdminPaymentListResponse> {
  const payload = await api.get<AdminPaymentListResponse>(
    `${adminPaymentsPath()}${queryString(query)}`,
  );
  return {
    payments: Array.isArray(payload.payments) ? payload.payments : [],
    page: payload.page ?? 1,
    limit: payload.limit ?? 20,
    total: payload.total ?? 0,
    pageCount: payload.pageCount ?? 0,
  };
}

export async function getAdminPayment(id: string): Promise<AdminPayment> {
  const payload = await api.get<{ payment: AdminPayment }>(
    adminPaymentsPath(id),
  );
  return unwrap(payload);
}

export async function createAdminPayment(
  body: CreatePaymentInput,
): Promise<AdminPayment> {
  const payload = await api.post<{ payment: AdminPayment }>(
    adminPaymentsPath(),
    body as Record<string, unknown>,
  );
  return unwrap(payload);
}

export async function updateAdminPayment(
  id: string,
  body: UpdatePaymentInput,
): Promise<AdminPayment> {
  const payload = await api.patch<{ payment: AdminPayment }>(
    adminPaymentsPath(id),
    body as Record<string, unknown>,
  );
  return unwrap(payload);
}

export async function refundAdminPayment(
  id: string,
  body: RefundPaymentInput = {},
): Promise<AdminPayment> {
  const payload = await api.post<{ payment: AdminPayment }>(
    adminPaymentsPath(`${id}/refund`),
    body as Record<string, unknown>,
  );
  return unwrap(payload);
}

export async function getAdminRevenue(
  query: RevenueQuery = {},
): Promise<RevenueResponse> {
  return api.get<RevenueResponse>(`${adminRevenuePath()}${queryString(query)}`);
}

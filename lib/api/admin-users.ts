import { api } from "@/lib/api/client";
import { adminUsersPath, queryString } from "@/lib/api/config";
import type {
  AdminSubscription,
  AdminUserDetail,
  AdminUserListResponse,
  BanUserInput,
  GrantPlanAccessInput,
  ListAdminUsersQuery,
  UpdateAdminUserInput,
} from "@/lib/api/types";

export async function listAdminUsers(
  query: ListAdminUsersQuery = {},
): Promise<AdminUserListResponse> {
  const payload = await api.get<AdminUserListResponse>(
    `${adminUsersPath()}${queryString(query)}`,
  );
  return {
    users: Array.isArray(payload.users) ? payload.users : [],
    page: payload.page ?? 1,
    limit: payload.limit ?? 20,
    total: payload.total ?? 0,
    pageCount: payload.pageCount ?? 0,
  };
}

export async function getAdminUser(id: string): Promise<AdminUserDetail> {
  return api.get<AdminUserDetail>(adminUsersPath(id));
}

export async function updateAdminUser(
  id: string,
  body: UpdateAdminUserInput,
): Promise<AdminUserDetail> {
  return api.patch<AdminUserDetail>(
    adminUsersPath(id),
    body as Record<string, unknown>,
  );
}

export async function banAdminUser(
  id: string,
  body: BanUserInput = {},
): Promise<AdminUserDetail> {
  return api.post<AdminUserDetail>(
    adminUsersPath(`${id}/ban`),
    body as Record<string, unknown>,
  );
}

export async function unbanAdminUser(id: string): Promise<AdminUserDetail> {
  return api.post<AdminUserDetail>(adminUsersPath(`${id}/unban`), {});
}

export async function trashAdminUser(id: string): Promise<AdminUserDetail> {
  return api.post<AdminUserDetail>(adminUsersPath(`${id}/trash`), {});
}

export async function restoreAdminUser(id: string): Promise<AdminUserDetail> {
  return api.post<AdminUserDetail>(adminUsersPath(`${id}/restore`), {});
}

export async function deleteAdminUser(id: string): Promise<void> {
  await api.delete(adminUsersPath(id));
}

function unwrapSubscription(
  payload: { subscription: AdminSubscription } | AdminSubscription,
): AdminSubscription {
  if (payload && typeof payload === "object" && "subscription" in payload) {
    return payload.subscription;
  }
  return payload as AdminSubscription;
}

export async function grantAdminUserAccess(
  id: string,
  body: GrantPlanAccessInput,
): Promise<AdminSubscription> {
  const payload = await api.post<{ subscription: AdminSubscription }>(
    adminUsersPath(`${id}/grant-access`),
    body as Record<string, unknown>,
  );
  return unwrapSubscription(payload);
}

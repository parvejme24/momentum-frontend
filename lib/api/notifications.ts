import { api } from "@/lib/api/client";
import {
  adminNotificationsPath,
  notificationsPath,
  queryString,
} from "@/lib/api/config";
import type {
  AppNotification,
  ListNotificationsQuery,
  NotificationAudience,
  NotificationListResponse,
} from "@/lib/api/types";

function root(audience: NotificationAudience) {
  return audience === "admin" ? adminNotificationsPath : notificationsPath;
}

function unwrapList(
  payload: NotificationListResponse,
): NotificationListResponse {
  return {
    notifications: Array.isArray(payload.notifications)
      ? payload.notifications
      : [],
    page: payload.page ?? 1,
    limit: payload.limit ?? 20,
    total: payload.total ?? 0,
    pageCount: payload.pageCount ?? 0,
    unreadCount: payload.unreadCount ?? 0,
  };
}

export async function listNotifications(
  audience: NotificationAudience,
  query: ListNotificationsQuery = {},
): Promise<NotificationListResponse> {
  const payload = await api.get<NotificationListResponse>(
    `${root(audience)()}${queryString(query)}`,
  );
  return unwrapList(payload);
}

export async function unreadNotificationCount(
  audience: NotificationAudience,
): Promise<number> {
  const payload = await api.get<{ count: number }>(
    root(audience)("unread-count"),
  );
  return payload.count ?? 0;
}

export async function markNotificationRead(
  audience: NotificationAudience,
  id: string,
): Promise<AppNotification> {
  const payload = await api.post<{ notification: AppNotification }>(
    root(audience)(`${id}/read`),
    {},
  );
  return payload.notification;
}

export async function markAllNotificationsRead(
  audience: NotificationAudience,
): Promise<{ count: number }> {
  return api.post<{ count: number }>(root(audience)("read-all"), {});
}

export async function deleteNotification(
  audience: NotificationAudience,
  id: string,
): Promise<void> {
  await api.delete(root(audience)(id));
}

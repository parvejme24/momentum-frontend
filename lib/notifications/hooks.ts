"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadNotificationCount,
} from "@/lib/api/notifications";
import type {
  ListNotificationsQuery,
  NotificationAudience,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";
import { isAdmin } from "@/lib/auth/role";
import { notificationKeys } from "@/lib/notifications/keys";

export function useNotificationAudience(): NotificationAudience {
  const { user } = useAuth();
  return isAdmin(user) ? "admin" : "user";
}

export function useNotifications(query: ListNotificationsQuery = {}) {
  const { user, isLoading } = useAuth();
  const audience = useNotificationAudience();
  return useQuery({
    queryKey: notificationKeys.list(audience, query),
    queryFn: () => listNotifications(audience, query),
    enabled: !isLoading && Boolean(user),
  });
}

export function useUnreadNotificationCount() {
  const { user, isLoading } = useAuth();
  const audience = useNotificationAudience();
  return useQuery({
    queryKey: notificationKeys.unread(audience),
    queryFn: () => unreadNotificationCount(audience),
    enabled: !isLoading && Boolean(user),
    refetchInterval: 60_000,
  });
}

function useInvalidateNotifications() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
}

export function useMarkNotificationRead() {
  const audience = useNotificationAudience();
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(audience, id),
    onSuccess: () => invalidate(),
  });
}

export function useMarkAllNotificationsRead() {
  const audience = useNotificationAudience();
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(audience),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteNotification() {
  const audience = useNotificationAudience();
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (id: string) => deleteNotification(audience, id),
    onSuccess: () => invalidate(),
  });
}

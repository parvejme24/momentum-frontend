"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createHabitReminder,
  listGroupedReminders,
  listHabitReminders,
  updateReminder,
} from "@/lib/api/reminders";
import type { CreateReminderRequest, UpdateReminderRequest } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";
import { reminderKeys } from "@/lib/reminders/keys";

export function useHabitReminders(habitId: string) {
  const { user, isLoading } = useAuth();

  return useQuery({
    queryKey: reminderKeys.habit(habitId),
    queryFn: () => listHabitReminders(habitId),
    enabled: !isLoading && Boolean(user) && Boolean(habitId),
  });
}

export function useGroupedReminders() {
  const { user, isLoading } = useAuth();

  return useQuery({
    queryKey: reminderKeys.grouped(),
    queryFn: listGroupedReminders,
    enabled: !isLoading && Boolean(user),
  });
}

function useInvalidateReminders() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: reminderKeys.all });
}

export function useCreateReminder(habitId: string) {
  const invalidate = useInvalidateReminders();

  return useMutation({
    mutationFn: (body: CreateReminderRequest) =>
      createHabitReminder(habitId, body),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateReminder() {
  const invalidate = useInvalidateReminders();

  return useMutation({
    mutationFn: ({
      reminderId,
      body,
    }: {
      reminderId: string;
      body: UpdateReminderRequest;
    }) => updateReminder(reminderId, body),
    onSuccess: () => invalidate(),
  });
}

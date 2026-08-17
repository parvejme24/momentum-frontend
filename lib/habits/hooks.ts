"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { archiveHabit, createHabit, deleteHabit, getHabit, listHabits, restoreHabit } from "@/lib/api/habits";
import type { CreateHabitRequest } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";
import { habitKeys } from "@/lib/habits/keys";
import { reminderKeys } from "@/lib/reminders/keys";
import { statsKeys } from "@/lib/stats/keys";
import { todayKeys } from "@/lib/today/keys";

export function useHabits(archived = false) {
  const { user, isLoading } = useAuth();

  return useQuery({
    queryKey: habitKeys.list(archived),
    queryFn: () => listHabits({ archived }),
    enabled: !isLoading && Boolean(user),
  });
}

export function useHabit(id: string) {
  const { user, isLoading } = useAuth();

  return useQuery({
    queryKey: habitKeys.detail(id),
    queryFn: () => getHabit(id),
    enabled: !isLoading && Boolean(user) && Boolean(id),
  });
}

function useInvalidateHabits() {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: habitKeys.all }),
      queryClient.invalidateQueries({ queryKey: todayKeys.all }),
      queryClient.invalidateQueries({ queryKey: statsKeys.all }),
      queryClient.invalidateQueries({ queryKey: reminderKeys.all }),
    ]);
}

export function useCreateHabit() {
  const invalidate = useInvalidateHabits();

  return useMutation({
    mutationFn: (body: CreateHabitRequest) => createHabit(body),
    onSuccess: () => invalidate(),
  });
}

export function useArchiveHabit() {
  const invalidate = useInvalidateHabits();

  return useMutation({
    mutationFn: (id: string) => archiveHabit(id),
    onSuccess: () => invalidate(),
  });
}

export function useRestoreHabit() {
  const invalidate = useInvalidateHabits();

  return useMutation({
    mutationFn: (id: string) => restoreHabit(id),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteHabit() {
  const invalidate = useInvalidateHabits();

  return useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onSuccess: () => invalidate(),
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteHabitLog, upsertHabitLog } from "@/lib/api/logs";
import { getToday } from "@/lib/api/today";
import type { TodayHabitItem, UpsertLogRequest } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";
import { habitKeys } from "@/lib/habits/keys";
import { logKeys } from "@/lib/logs/keys";
import { statsKeys } from "@/lib/stats/keys";
import { todayKeys } from "@/lib/today/keys";

export function useToday(date?: string) {
  const { user, isLoading } = useAuth();

  return useQuery({
    queryKey: todayKeys.date(date),
    queryFn: () => getToday(date),
    enabled: !isLoading && Boolean(user),
  });
}

function useInvalidateAfterLog() {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: todayKeys.all }),
      queryClient.invalidateQueries({ queryKey: habitKeys.all }),
      queryClient.invalidateQueries({ queryKey: logKeys.all }),
      queryClient.invalidateQueries({ queryKey: statsKeys.all }),
    ]);
}

export function useToggleTodayLog() {
  const invalidate = useInvalidateAfterLog();

  return useMutation({
    mutationFn: async ({
      habit,
      date,
    }: {
      habit: TodayHabitItem;
      date: string;
    }) => {
      const marked =
        habit.log?.status === "DONE" || habit.log?.status === "PARTIAL";
      if (marked) {
        return deleteHabitLog(habit.id, date);
      }
      const body: UpsertLogRequest = { status: "DONE" };
      if (habit.targetValue != null) body.value = habit.targetValue;
      return upsertHabitLog(habit.id, date, body);
    },
    onSuccess: () => invalidate(),
  });
}

export function useUpsertLog() {
  const invalidate = useInvalidateAfterLog();

  return useMutation({
    mutationFn: ({
      habitId,
      localDate,
      body,
    }: {
      habitId: string;
      localDate: string;
      body?: UpsertLogRequest;
    }) => upsertHabitLog(habitId, localDate, body ?? {}),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteLog() {
  const invalidate = useInvalidateAfterLog();

  return useMutation({
    mutationFn: ({ habitId, localDate }: { habitId: string; localDate: string }) =>
      deleteHabitLog(habitId, localDate),
    onSuccess: () => invalidate(),
  });
}

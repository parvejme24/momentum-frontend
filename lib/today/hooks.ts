"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteHabitLog, upsertHabitLog } from "@/lib/api/logs";
import { getToday } from "@/lib/api/today";
import type {
  TodayHabitItem,
  TodayResponse,
  UpsertLogRequest,
} from "@/lib/api/types";
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
    placeholderData: (previous) => previous,
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

function applyOptimisticToggle(
  data: TodayResponse,
  habitId: string,
): TodayResponse {
  const habits = data.habits.map((habit) => {
    if (habit.id !== habitId) return habit;
    const marked =
      habit.log?.status === "DONE" || habit.log?.status === "PARTIAL";
    if (marked) {
      return {
        ...habit,
        log: null,
        streak: {
          ...habit.streak,
          current: Math.max(0, habit.streak.current - 1),
        },
      };
    }
    return {
      ...habit,
      log: {
        status: "DONE" as const,
        value: habit.targetValue,
        note: null,
      },
      streak: {
        ...habit.streak,
        current: habit.streak.current + 1,
        longest: Math.max(habit.streak.longest, habit.streak.current + 1),
      },
    };
  });

  const completed = habits.filter(
    (habit) =>
      habit.log?.status === "DONE" || habit.log?.status === "PARTIAL",
  ).length;
  const total = habits.length;

  return {
    ...data,
    habits,
    summary: {
      ...data.summary,
      total,
      completed,
      rate: total === 0 ? 0 : completed / total,
    },
  };
}

export function useToggleTodayLog() {
  const queryClient = useQueryClient();
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
    onMutate: ({ habit, date }) => {
      const key = todayKeys.date(date);
      queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TodayResponse>(key);
      if (previous) {
        queryClient.setQueryData(key, applyOptimisticToggle(previous, habit.id));
      }
      return { previous, key };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous && context.key) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: () => {
      void invalidate();
    },
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

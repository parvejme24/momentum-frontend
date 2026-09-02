"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

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

/** Mark list caches stale without refetching — screens pick up fresh data on visit. */
function markListCachesStale(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: habitKeys.lists(),
      refetchType: "none",
    }),
    queryClient.invalidateQueries({
      queryKey: statsKeys.overviewRoot(),
      refetchType: "none",
    }),
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
    onSettled: (_data, _error, vars) => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: todayKeys.date(vars.date) }),
        queryClient.invalidateQueries({
          queryKey: logKeys.all,
          refetchType: "none",
        }),
        markListCachesStale(queryClient),
      ]);
    },
  });
}

function invalidateAfterHabitLog(
  queryClient: QueryClient,
  habitId: string,
  localDate: string,
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: todayKeys.date(localDate) }),
    queryClient.invalidateQueries({ queryKey: logKeys.habitRoot(habitId) }),
    queryClient.invalidateQueries({ queryKey: habitKeys.detail(habitId) }),
    queryClient.invalidateQueries({ queryKey: statsKeys.habitRoot(habitId) }),
    markListCachesStale(queryClient),
  ]);
}

export function useUpsertLog() {
  const queryClient = useQueryClient();

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
    onSuccess: (_data, vars) =>
      invalidateAfterHabitLog(queryClient, vars.habitId, vars.localDate),
  });
}

export function useDeleteLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, localDate }: { habitId: string; localDate: string }) =>
      deleteHabitLog(habitId, localDate),
    onSuccess: (_data, vars) =>
      invalidateAfterHabitLog(queryClient, vars.habitId, vars.localDate),
  });
}

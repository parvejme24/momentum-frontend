import type { QueryClient } from "@tanstack/react-query";

import { listHabits } from "@/lib/api/habits";
import { getOverviewStats } from "@/lib/api/stats";
import { getToday } from "@/lib/api/today";
import { habitKeys } from "@/lib/habits/keys";
import { statsKeys } from "@/lib/stats/keys";
import { todayKeys } from "@/lib/today/keys";

/** Habits and stats change slowly — keep cached UI ready across navigations. */
export const HABITS_STALE_MS = 3 * 60_000;
export const STATS_STALE_MS = 3 * 60_000;

export function prefetchAppRoute(queryClient: QueryClient, href: string) {
  if (href === "/dashboard") {
    return queryClient.prefetchQuery({
      queryKey: todayKeys.date(),
      queryFn: () => getToday(),
    });
  }

  if (href === "/habits") {
    return queryClient.prefetchQuery({
      queryKey: habitKeys.list(false),
      queryFn: () => listHabits({ archived: false }),
      staleTime: HABITS_STALE_MS,
    });
  }

  if (href === "/habits/archived") {
    return queryClient.prefetchQuery({
      queryKey: habitKeys.list(true),
      queryFn: () => listHabits({ archived: true }),
      staleTime: HABITS_STALE_MS,
    });
  }

  if (href === "/stats") {
    return queryClient.prefetchQuery({
      queryKey: statsKeys.overview("90d"),
      queryFn: () => getOverviewStats("90d"),
      staleTime: STATS_STALE_MS,
    });
  }
}

export function navPrefetchHandlers(
  queryClient: QueryClient,
  href: string,
) {
  const prefetch = () => {
    void prefetchAppRoute(queryClient, href);
  };

  return {
    onPointerEnter: prefetch,
    onFocus: prefetch,
    onPointerDown: prefetch,
  };
}

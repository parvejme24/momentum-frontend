import type { RevenueQuery } from "@/lib/api/types";

/** Poll interval for admin payment list + revenue cards. */
export const ADMIN_LIVE_REFETCH_MS = 30_000;

/** Wide revenue window so stats reflect all recorded payments (API defaults to 30 days). */
export function allTimeRevenueQuery(
  overrides: RevenueQuery = {},
): RevenueQuery {
  const today = new Date().toISOString().slice(0, 10);
  return {
    groupBy: "month",
    from: "2020-01-01",
    to: today,
    ...overrides,
  };
}

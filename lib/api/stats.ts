import { api } from "@/lib/api/client";
import { habitPath, queryString, statsPath } from "@/lib/api/config";
import type {
  HabitStatsResponse,
  OverviewStatsResponse,
  StatsRange,
} from "@/lib/api/types";

export async function getHabitStats(
  habitId: string,
  range: StatsRange = "90d",
): Promise<HabitStatsResponse> {
  return api.get<HabitStatsResponse>(
    `${habitPath(`${habitId}/stats`)}${queryString({ range })}`,
  );
}

export async function getOverviewStats(
  range: StatsRange = "90d",
): Promise<OverviewStatsResponse> {
  return api.get<OverviewStatsResponse>(
    `${statsPath("overview")}${queryString({ range })}`,
  );
}

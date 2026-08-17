import { api } from "@/lib/api/client";
import { queryString, todayPath } from "@/lib/api/config";
import type { TodayResponse } from "@/lib/api/types";

export async function getToday(date?: string): Promise<TodayResponse> {
  return api.get<TodayResponse>(`${todayPath()}${queryString({ date })}`);
}

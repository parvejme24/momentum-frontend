import { api } from "@/lib/api/client";
import { habitPath, logsPath, queryString } from "@/lib/api/config";
import type {
  DeleteLogResponse,
  HabitLogListItem,
  LogEntry,
  LogRangeQuery,
  UpsertLogRequest,
  UpsertLogResponse,
} from "@/lib/api/types";

export async function upsertHabitLog(
  habitId: string,
  localDate: string,
  body: UpsertLogRequest = {},
): Promise<UpsertLogResponse> {
  return api.put<UpsertLogResponse>(
    habitPath(`${habitId}/logs/${localDate}`),
    body as Record<string, unknown>,
  );
}

export async function deleteHabitLog(
  habitId: string,
  localDate: string,
): Promise<DeleteLogResponse> {
  return api.delete<DeleteLogResponse>(habitPath(`${habitId}/logs/${localDate}`));
}

export async function listHabitLogs(
  habitId: string,
  query: LogRangeQuery,
): Promise<LogEntry[]> {
  const payload = await api.get<{ logs: LogEntry[] }>(
    `${habitPath(`${habitId}/logs`)}${queryString(query)}`,
  );
  return Array.isArray(payload.logs) ? payload.logs : [];
}

export async function listAllLogs(
  query: LogRangeQuery,
): Promise<HabitLogListItem[]> {
  const payload = await api.get<{ logs: HabitLogListItem[] }>(
    `${logsPath()}${queryString(query)}`,
  );
  return Array.isArray(payload.logs) ? payload.logs : [];
}

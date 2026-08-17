import { api } from "@/lib/api/client";
import { habitPath } from "@/lib/api/config";
import type {
  CreateHabitRequest,
  Habit,
  HabitListResponse,
  HabitResponse,
  ListHabitsQuery,
  ReorderHabitsRequest,
  UpdateHabitRequest,
} from "@/lib/api/types";

function unwrapHabit(payload: HabitResponse | Habit): Habit {
  if (payload && typeof payload === "object" && "habit" in payload) {
    return payload.habit;
  }
  return payload as Habit;
}

function unwrapHabits(payload: HabitListResponse | Habit[]): Habit[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray(payload.habits)) {
    return payload.habits;
  }
  return [];
}

export async function listHabits(query: ListHabitsQuery = {}): Promise<Habit[]> {
  const search = new URLSearchParams();
  if (query.archived) search.set("archived", "true");
  const suffix = search.size > 0 ? `?${search.toString()}` : "";
  const payload = await api.get<HabitListResponse>(`${habitPath()}${suffix}`);
  return unwrapHabits(payload);
}

export async function getHabit(id: string): Promise<Habit> {
  const payload = await api.get<HabitResponse>(habitPath(id));
  return unwrapHabit(payload);
}

export async function createHabit(body: CreateHabitRequest): Promise<Habit> {
  const payload = await api.post<HabitResponse>(habitPath(), body);
  return unwrapHabit(payload);
}

export async function updateHabit(
  id: string,
  body: UpdateHabitRequest,
): Promise<Habit> {
  const payload = await api.patch<HabitResponse>(habitPath(id), body);
  return unwrapHabit(payload);
}

export async function reorderHabits(body: ReorderHabitsRequest): Promise<Habit[]> {
  const payload = await api.patch<HabitListResponse>(habitPath("reorder"), body);
  return unwrapHabits(payload);
}

export async function archiveHabit(id: string): Promise<Habit> {
  const payload = await api.post<HabitResponse>(habitPath(`${id}/archive`), {});
  return unwrapHabit(payload);
}

export async function restoreHabit(id: string): Promise<Habit> {
  const payload = await api.post<HabitResponse>(habitPath(`${id}/restore`), {});
  return unwrapHabit(payload);
}

export async function deleteHabit(id: string): Promise<void> {
  await api.delete(habitPath(`${id}?confirm=true`));
}

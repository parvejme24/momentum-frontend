import { api } from "@/lib/api/client";
import { habitPath, reminderPath } from "@/lib/api/config";
import type {
  CreateReminderRequest,
  GroupedRemindersResponse,
  Reminder,
  ReminderMutationResponse,
  UpdateReminderRequest,
} from "@/lib/api/types";

export async function listHabitReminders(habitId: string): Promise<Reminder[]> {
  const payload = await api.get<{ reminders: Reminder[] }>(
    habitPath(`${habitId}/reminders`),
  );
  return Array.isArray(payload.reminders) ? payload.reminders : [];
}

export async function createHabitReminder(
  habitId: string,
  body: CreateReminderRequest,
): Promise<ReminderMutationResponse> {
  return api.post<ReminderMutationResponse>(
    habitPath(`${habitId}/reminders`),
    body as Record<string, unknown>,
  );
}

export async function listGroupedReminders(): Promise<GroupedRemindersResponse> {
  return api.get<GroupedRemindersResponse>(reminderPath());
}

export async function updateReminder(
  reminderId: string,
  body: UpdateReminderRequest,
): Promise<ReminderMutationResponse> {
  return api.patch<ReminderMutationResponse>(
    reminderPath(reminderId),
    body as Record<string, unknown>,
  );
}

export async function deleteReminder(reminderId: string): Promise<void> {
  await api.delete(reminderPath(reminderId));
}

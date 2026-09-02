import { listHabits } from "@/lib/api/habits";
import { listAllLogs } from "@/lib/api/logs";
import { listGroupedReminders } from "@/lib/api/reminders";
import type {
  Habit,
  HabitLogListItem,
  Reminder,
  User,
} from "@/lib/api/types";
import { addDaysIso, isoDateInTimeZone } from "@/lib/dates";

const LOG_RANGE_DAYS = 400;

export type MomentumExport = {
  exportedAt: string;
  timezone: string;
  user: {
    name: string;
    email: string;
    timezone: string;
    weekStartsOn: number;
  };
  habits: Omit<Habit, "history">[];
  logs: HabitLogListItem[];
  reminders: Array<Reminder & { habitTitle: string }>;
};

function minIso(a: string, b: string) {
  return a < b ? a : b;
}

function maxIso(a: string, b: string) {
  return a > b ? a : b;
}

function habitDate(habit: Habit): string {
  const created = habit.createdAt.slice(0, 10);
  return minIso(habit.startDate || created, created);
}

function csvCell(value: string | number | boolean | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function downloadFile(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

async function listLogsInChunks(from: string, to: string): Promise<HabitLogListItem[]> {
  if (from > to) return [];

  const logs: HabitLogListItem[] = [];
  let cursor = from;

  while (cursor <= to) {
    const chunkEnd = minIso(addDaysIso(cursor, LOG_RANGE_DAYS - 1), to);
    const chunk = await listAllLogs({ from: cursor, to: chunkEnd });
    logs.push(...chunk);
    cursor = addDaysIso(chunkEnd, 1);
  }

  return logs;
}

export async function collectMomentumExport(user: User): Promise<MomentumExport> {
  const timezone = user.timezone || "UTC";
  const today = isoDateInTimeZone(timezone);

  const [active, archived, grouped] = await Promise.all([
    listHabits({ archived: false }),
    listHabits({ archived: true }),
    listGroupedReminders(),
  ]);

  const habits = [...active, ...archived];
  const from = habits.reduce(
    (earliest, habit) => minIso(earliest, habitDate(habit)),
    today,
  );
  const logs = await listLogsInChunks(from, maxIso(from, today));

  const reminders = grouped.habits.flatMap((group) =>
    group.reminders.map((reminder) => ({
      ...reminder,
      habitTitle: group.title,
    })),
  );

  return {
    exportedAt: new Date().toISOString(),
    timezone,
    user: {
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      weekStartsOn: user.weekStartsOn,
    },
    habits: habits.map((habit) => {
      const { history: _, ...rest } = habit;
      return rest;
    }),
    logs,
    reminders,
  };
}

export function exportToJson(data: MomentumExport): string {
  return `${JSON.stringify(data, null, 2)}\n`;
}

export function exportToCsv(data: MomentumExport): string {
  const habitById = new Map(data.habits.map((habit) => [habit.id, habit]));

  const habitHeader = [
    "Habit name",
    "Habit ID",
    "Type",
    "Schedule",
    "Start date",
    "Archived",
    "Current streak",
    "Target",
    "Unit",
    "Created",
  ];

  const habitRows = data.habits.map((habit) =>
    [
      csvCell(habit.title),
      csvCell(habit.id),
      csvCell(habitTypeLabel(habit.type)),
      csvCell(habit.scheduleLabel),
      csvCell(habit.startDate),
      csvCell(habit.archivedAt ? "Yes" : "No"),
      csvCell(habit.currentStreak),
      csvCell(habit.targetValue),
      csvCell(habit.unit),
      csvCell(habit.createdAt.slice(0, 10)),
    ].join(","),
  );

  const logHeader = [
    "Habit name",
    "Habit ID",
    "Date",
    "Status",
    "Value",
    "Unit",
    "Note",
  ];

  const logRows = data.logs.map((log) => {
    const habitId = logHabitId(log);
    const habit = habitById.get(habitId);
    return [
      csvCell(habit?.title || "Unknown habit"),
      csvCell(habitId),
      csvCell(log.localDate),
      csvCell(statusLabel(log.status)),
      csvCell(log.value),
      csvCell(habit?.unit ?? ""),
      csvCell(log.note),
    ].join(",");
  });

  const parts = [
    "Habits",
    habitHeader.join(","),
    ...habitRows,
    "",
    "Check-ins",
    logHeader.join(","),
    ...logRows,
  ];

  return `${parts.join("\n")}\n`;
}

function logHabitId(log: HabitLogListItem): string {
  if (typeof log.habitId === "string" && log.habitId) return log.habitId;
  const raw = log as HabitLogListItem & { habit_id?: string };
  return typeof raw.habit_id === "string" ? raw.habit_id : "";
}

function habitTypeLabel(type: Habit["type"]) {
  return type === "BREAK" ? "Break" : "Build";
}

function statusLabel(status: HabitLogListItem["status"]) {
  if (status === "DONE") return "Done";
  if (status === "PARTIAL") return "Partial";
  if (status === "SKIPPED") return "Skipped";
  return status;
}

export async function downloadMomentumExport(
  user: User,
  format: "JSON" | "CSV",
) {
  const data = await collectMomentumExport(user);
  const stamp = isoDateInTimeZone(user.timezone).replaceAll("-", "");

  if (format === "JSON") {
    downloadFile(
      `momentum-export-${stamp}.json`,
      exportToJson(data),
      "application/json;charset=utf-8",
    );
    return;
  }

  downloadFile(
    `momentum-export-${stamp}.csv`,
    `\uFEFF${exportToCsv(data)}`,
    "text/csv;charset=utf-8",
  );
}

import {
  ACTIVE_HABITS,
  INITIAL_ARCHIVED,
  type LibraryHabit,
} from "@/components/habits/sample-data";

export type HabitReminder = {
  id: string;
  time: string;
  schedule: string;
  timezone?: string;
  enabled: boolean;
  paused?: boolean;
};

export type RecentDayStatus = "done" | "partial" | "skipped";

export type RecentDay = {
  id: string;
  label: string;
  quantity?: string;
  status: RecentDayStatus;
};

export type HabitDetail = {
  id: string;
  title: string;
  emoji: string;
  tint: string;
  schedule: string;
  quantityLabel?: string;
  reminderLabel?: string;
  unit: string;
  markedToday: boolean;
  todayQuantity?: { current: number; target: number };
  currentStreak: number;
  longestStreak: number;
  longestRange: string;
  completionRate: number;
  completedDays: number;
  trackedDays: number;
  totalLogged: number;
  totalLoggedUnit: string;
  weekRates: number[];
  weekdayRates: number[];
  weekdayInsight: string;
  reminders: HabitReminder[];
  recentDays: RecentDay[];
  heatSeed: number;
  fillRate: number;
  activeWeekdays?: number[];
};

const READ_DETAIL: HabitDetail = {
  id: "read",
  title: "Read 30 pages",
  emoji: "📖",
  tint: "var(--blue-soft)",
  schedule: "Every day",
  quantityLabel: "30 pages",
  reminderLabel: "Reminder 21:30",
  unit: "pages",
  markedToday: true,
  todayQuantity: { current: 32, target: 30 },
  currentStreak: 47,
  longestStreak: 61,
  longestRange: "Feb 3 → Apr 4",
  completionRate: 86,
  completedDays: 313,
  trackedDays: 364,
  totalLogged: 9412,
  totalLoggedUnit: "pages read",
  weekRates: [0.42, 0.55, 0.48, 0.61, 0.7, 0.58, 0.74, 0.81, 0.69, 0.86, 0.78, 0.91],
  weekdayRates: [0.88, 0.91, 0.86, 0.9, 0.84, 0.61, 0.87],
  weekdayInsight:
    "Friday is your weakest day at 61%. Everything else sits above 82% — it's a Friday problem, not a reading problem.",
  reminders: [
    {
      id: "evening",
      time: "21:30",
      schedule: "Every day",
      timezone: "Asia/Dhaka",
      enabled: true,
    },
    {
      id: "morning",
      time: "07:00",
      schedule: "Weekends only",
      enabled: false,
      paused: true,
    },
  ],
  recentDays: [
    { id: "d0", label: "Today", quantity: "32 pages", status: "done" },
    { id: "d1", label: "Yesterday", quantity: "30 pages", status: "done" },
    { id: "d2", label: "2 days ago", quantity: "18 pages", status: "partial" },
    { id: "d3", label: "3 days ago", status: "skipped" },
    { id: "d4", label: "4 days ago", quantity: "41 pages", status: "done" },
  ],
  heatSeed: 101,
  fillRate: 0.86,
};

function detailFromLibrary(habit: LibraryHabit): HabitDetail {
  const unit =
    habit.detail?.replace(/^\d+\s*/, "") ||
    (habit.categories.includes("quitting") ? "days held" : "logs");
  const targetMatch = habit.detail?.match(/^(\d+)/);
  const target = targetMatch ? Number(targetMatch[1]) : undefined;

  return {
    id: habit.id,
    title: habit.title,
    emoji: habit.emoji,
    tint: habit.tint,
    schedule: habit.schedule,
    quantityLabel: habit.detail,
    unit,
    markedToday: habit.streakDays > 0,
    todayQuantity:
      target != null
        ? {
            current: habit.streakDays > 0 ? target : 0,
            target,
          }
        : undefined,
    currentStreak: habit.streakDays,
    longestStreak: habit.streakDays + 8,
    longestRange: "Mar 1 → Apr 12",
    completionRate: habit.rate ?? Math.round(habit.fillRate * 100),
    completedDays: Math.round(364 * habit.fillRate),
    trackedDays: 364,
    totalLogged: Math.round(habit.fillRate * 3200),
    totalLoggedUnit: unit,
    weekRates: [0.4, 0.52, 0.48, 0.6, 0.66, 0.58, 0.7, 0.74, 0.68, 0.8, 0.76, 0.84],
    weekdayRates: [0.82, 0.88, 0.85, 0.9, 0.8, 0.72, 0.84],
    weekdayInsight:
      "One weekday still lags the rest. Protect that day and the chain holds more easily.",
    reminders: [
      {
        id: "default",
        time: "20:00",
        schedule: habit.schedule,
        timezone: "Asia/Dhaka",
        enabled: true,
      },
    ],
    recentDays: [
      {
        id: "d0",
        label: "Today",
        quantity: target != null ? `${target} ${unit}` : undefined,
        status: habit.streakDays > 0 ? "done" : "skipped",
      },
      {
        id: "d1",
        label: "Yesterday",
        quantity: target != null ? `${target} ${unit}` : undefined,
        status: "done",
      },
      { id: "d2", label: "2 days ago", status: "skipped" },
      {
        id: "d3",
        label: "3 days ago",
        quantity: target != null ? `${Math.max(1, target - 4)} ${unit}` : undefined,
        status: "partial",
      },
      {
        id: "d4",
        label: "4 days ago",
        quantity: target != null ? `${target} ${unit}` : undefined,
        status: "done",
      },
    ],
    heatSeed: habit.heatSeed,
    fillRate: habit.fillRate,
    activeWeekdays: habit.activeWeekdays,
  };
}

export function getHabitDetail(id: string): HabitDetail | null {
  if (id === "read") return READ_DETAIL;

  const active = ACTIVE_HABITS.find((h) => h.id === id);
  if (active) return detailFromLibrary(active);

  const archived = INITIAL_ARCHIVED.find((h) => h.id === id);
  if (!archived) return null;

  return {
    id: archived.id,
    title: archived.title,
    emoji: archived.emoji,
    tint: archived.tint,
    schedule: archived.schedule,
    unit: "logs",
    markedToday: false,
    currentStreak: 0,
    longestStreak: 21,
    longestRange: archived.bestLabel.replace(/^best\s+/i, ""),
    completionRate: archived.rate,
    completedDays: Math.round(364 * (archived.rate / 100)),
    trackedDays: 364,
    totalLogged: Math.round(archived.rate * 40),
    totalLoggedUnit: "logs",
    weekRates: [0.3, 0.35, 0.4, 0.38, 0.45, 0.5, 0.48, 0.55, 0.52, 0.58, 0.6, 0.62],
    weekdayRates: [0.7, 0.72, 0.68, 0.75, 0.66, 0.55, 0.7],
    weekdayInsight:
      "This habit is archived. History stays here if you restore it from Habits.",
    reminders: [],
    recentDays: [
      { id: "d0", label: "Today", status: "skipped" },
      { id: "d1", label: "Yesterday", status: "skipped" },
      { id: "d2", label: "2 days ago", quantity: "1 log", status: "done" },
    ],
    heatSeed: archived.id.length * 91,
    fillRate: archived.rate / 100,
  };
}

export const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function statusLabel(status: RecentDayStatus) {
  if (status === "done") return "Done";
  if (status === "partial") return "Partial";
  return "Skipped";
}

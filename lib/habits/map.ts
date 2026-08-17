import type { HabitDetail } from "@/components/habits/habit-detail-data";
import type {
  ColorId,
  HabitType,
  ScheduleInput,
} from "@/components/habits/schedule-utils";
import { tintForColor } from "@/components/habits/schedule-utils";
import type { ArchivedHabit, LibraryHabit } from "@/components/habits/sample-data";
import type { CreateHabitRequest, Habit, HabitScheduleType } from "@/lib/api/types";

export const COLOR_HEX: Record<ColorId, string> = {
  blue: "#2B4CE0",
  flame: "#E24B2A",
  purple: "#7C5CBF",
  green: "#2F9E6E",
  gold: "#E8B931",
};

function hashSeed(id: string) {
  let n = 0;
  for (const char of id) n = (n * 31 + char.charCodeAt(0)) >>> 0;
  return n;
}

function completionPercent(value: number | undefined) {
  if (value == null) return 0;
  if (value <= 1) return Math.round(value * 100);
  return Math.round(value);
}

function formatArchivedAt(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function apiStartDate(iso: string) {
  const utcToday = new Date().toISOString().slice(0, 10);
  return iso > utcToday ? utcToday : iso;
}

export function tintFromApiColor(color: string | null | undefined) {
  if (!color) return "var(--blue-soft)";
  const normalized = color.trim().toUpperCase();
  const match = (Object.entries(COLOR_HEX) as [ColorId, string][]).find(
    ([, hex]) => hex.toUpperCase() === normalized,
  );
  if (match) return tintForColor(match[0]);
  return color;
}

export function toLibraryHabit(habit: Habit): LibraryHabit {
  const quitting = habit.type === "BREAK";
  const atRisk = habit.currentStreak === 0;
  const quantity =
    habit.targetValue != null && habit.unit
      ? `${habit.targetValue} ${habit.unit}`
      : habit.description || undefined;
  const rate = completionPercent(habit.completionRate);

  return {
    id: habit.id,
    title: habit.title,
    emoji: habit.icon || "✓",
    tint: tintFromApiColor(habit.color),
    categories: [
      quitting ? "quitting" : "building",
      ...(atRisk ? (["at-risk"] as const) : []),
    ],
    schedule: habit.scheduleLabel || "Every day",
    detail: quantity,
    streakDays: habit.currentStreak,
    rate,
    bestLabel: habit.currentStreak > 0 ? `best ${habit.currentStreak}` : "new",
    activeWeekdays:
      habit.scheduleType === "SPECIFIC_DAYS" ? habit.scheduleDays : undefined,
    heatSeed: hashSeed(habit.id),
    fillRate: rate / 100,
  };
}

export function toArchivedHabit(habit: Habit): ArchivedHabit {
  const library = toLibraryHabit(habit);
  return {
    id: library.id,
    title: library.title,
    emoji: library.emoji,
    tint: library.tint,
    schedule: library.schedule,
    rate: library.rate ?? 0,
    bestLabel: library.bestLabel ?? "archived",
    archivedAt: formatArchivedAt(habit.archivedAt),
    heatSeed: library.heatSeed,
    fillRate: library.fillRate,
  };
}

export function toCreateHabitRequest(input: {
  title: string;
  note: string;
  icon: string;
  colorId: ColorId;
  habitType: HabitType;
  schedule: ScheduleInput;
  measureTarget: string;
  measureUnit: string;
}): CreateHabitRequest {
  const body: CreateHabitRequest = {
    title: input.title,
    startDate: apiStartDate(input.schedule.startDate),
    color: COLOR_HEX[input.colorId],
    type: input.habitType === "quitting" ? "BREAK" : "BUILD",
    icon: input.icon,
  };

  if (input.note.trim()) body.description = input.note.trim();

  const target = Number(input.measureTarget.trim());
  if (Number.isFinite(target) && target > 0) body.targetValue = target;
  if (input.measureUnit.trim()) body.unit = input.measureUnit.trim();

  let scheduleType: HabitScheduleType = "DAILY";
  switch (input.schedule.mode) {
    case "weekdays":
      scheduleType = "SPECIFIC_DAYS";
      body.scheduleDays = input.schedule.weekdays;
      break;
    case "times_per_week":
      scheduleType = "TIMES_PER_WEEK";
      body.targetPerWeek = input.schedule.timesPerWeek;
      break;
    case "interval":
      scheduleType = "INTERVAL";
      body.intervalDays = input.schedule.intervalDays;
      break;
    default:
      scheduleType = "DAILY";
  }
  body.scheduleType = scheduleType;

  return body;
}

export function toHabitDetail(habit: Habit): HabitDetail {
  const library = toLibraryHabit(habit);
  const unit = habit.unit || "logs";
  const rate = completionPercent(habit.completionRate);

  return {
    id: habit.id,
    title: habit.title,
    emoji: library.emoji,
    tint: library.tint,
    schedule: library.schedule,
    quantityLabel: library.detail,
    unit,
    markedToday: false,
    todayQuantity:
      habit.targetValue != null
        ? { current: 0, target: habit.targetValue }
        : undefined,
    currentStreak: habit.currentStreak,
    longestStreak: habit.currentStreak,
    longestRange: habit.startDate ? `since ${habit.startDate}` : "—",
    completionRate: rate,
    completedDays: 0,
    trackedDays: 0,
    totalLogged: 0,
    totalLoggedUnit: unit,
    weekRates: [],
    weekdayRates: [],
    weekdayInsight: "Completion charts fill in as you log days.",
    reminders: [],
    recentDays: [],
    heatSeed: library.heatSeed,
    fillRate: library.fillRate,
    activeWeekdays: library.activeWeekdays,
    archived: Boolean(habit.archivedAt),
  };
}

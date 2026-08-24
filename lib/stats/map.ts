import type { HabitReminder, RecentDay } from "@/components/habits/habit-detail-data";
import type { HabitCompare, Insight, Milestone, SummaryTile } from "@/components/stats/sample-data";
import type {
  HabitStatsResponse,
  LogEntry,
  LogStatus,
  OverviewStatsResponse,
  Reminder,
} from "@/lib/api/types";
import { asPercent, formatPrettyIso } from "@/lib/dates";
import { normalizeHabitIcon } from "@/lib/habits/icon";

const WEEKDAY_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function formatReminderDays(days: number[]) {
  if (days.length === 7) return "Every day";
  const ordered = [...days].sort((a, b) => a - b);
  return ordered.map((day) => WEEKDAY_SHORT[day] ?? day).join(" · ");
}

export function toUiReminder(reminder: Reminder, timezone?: string): HabitReminder {
  return {
    id: reminder.id,
    time: reminder.timeLocal,
    schedule: formatReminderDays(reminder.daysOfWeek),
    timezone,
    enabled: reminder.enabled,
    paused: !reminder.enabled,
  };
}

export function toRecentDays(logs: LogEntry[], today: string): RecentDay[] {
  return [...logs]
    .sort((a, b) => (a.localDate < b.localDate ? 1 : -1))
    .slice(0, 14)
    .map((log) => ({
      id: log.localDate,
      label:
        log.localDate === today
          ? "Today"
          : formatPrettyIso(log.localDate, {
              weekday: "short",
              day: "numeric",
              month: "short",
            }),
      quantity: log.value != null ? String(log.value) : undefined,
      status: logStatusToUi(log.status),
    }));
}

function logStatusToUi(status: LogStatus): RecentDay["status"] {
  if (status === "DONE") return "done";
  if (status === "PARTIAL") return "partial";
  return "skipped";
}

export function lastWeekRates(
  weeks: Array<{ rate: number }>,
  count = 12,
): number[] {
  return weeks.slice(-count).map((week) => week.rate);
}

export function weekdayRatesInOrder(
  weekdays: Array<{ day: number; rate: number }>,
): number[] {
  return Array.from({ length: 7 }, (_, day) => {
    return weekdays.find((item) => item.day === day)?.rate ?? 0;
  });
}

export function weekdayInsight(
  weekdays: Array<{ day: number; name: string; rate: number; due?: number }>,
): string {
  const active = weekdays.filter((item) => (item.due == null ? true : item.due > 0));
  if (active.length === 0) return "Completion charts fill in as you log days.";
  const weakest = active.reduce((min, item) => (item.rate < min.rate ? item : min));
  const strongest = active.reduce((max, item) => (item.rate > max.rate ? item : max));
  if (weakest.day === strongest.day) {
    return "The week is even so far. Keep the chain moving.";
  }
  return `${weakest.name} lags ${strongest.name}. Protect that day and the chain holds more easily.`;
}

export function overviewSummary(data: OverviewStatsResponse): SummaryTile[] {
  return [
    {
      key: "Completion",
      value: `${asPercent(data.completion.rate)}%`,
      note: `${data.completion.done} of ${data.completion.due} due`,
    },
    {
      key: "Perfect days",
      value: String(data.totals.perfectDays),
      note: "every due habit marked",
    },
    {
      key: "Best streak",
      value: String(data.bestStreak?.length ?? 0),
      note: data.bestStreak?.title ?? "Start a chain",
      flame: true,
    },
    {
      key: "Active habits",
      value: String(data.totals.activeHabits),
      note: `${data.totals.daysTracked} days tracked`,
    },
  ];
}

export function overviewCompare(data: OverviewStatsResponse): HabitCompare[] {
  return data.habits.map((habit) => ({
    id: habit.id,
    title: habit.title,
    emoji: normalizeHabitIcon(habit.icon),
    tint: "var(--blue-soft)",
    rate: asPercent(habit.rate),
    heatSeed: habit.id.length * 91,
    fillRate: habit.rate <= 1 ? habit.rate : habit.rate / 100,
  }));
}

export function overviewMilestones(data: OverviewStatsResponse): Milestone[] {
  return data.habits
    .filter((habit) => habit.streak.longest > 0)
    .sort((a, b) => b.streak.longest - a.streak.longest)
    .slice(0, 4)
    .map((habit) => ({
      id: habit.id,
      emoji: normalizeHabitIcon(habit.icon),
      tint: "var(--blue-soft)",
      title: habit.title,
      detail: `Longest chain ${habit.streak.longest} days`,
      when: `now ${habit.streak.current}`,
    }));
}

export function overviewInsights(data: OverviewStatsResponse): Insight[] {
  const weekdays = data.byWeekday;
  const strongest = weekdays.reduce(
    (max, item) => (item.rate > max.rate ? item : max),
    weekdays[0] ?? { day: 0, name: "Sunday", rate: 0 },
  );
  const weakest = weekdays.reduce(
    (min, item) => (item.rate < min.rate ? item : min),
    weekdays[0] ?? { day: 0, name: "Sunday", rate: 0 },
  );

  const insights: Insight[] = [
    {
      id: "completion",
      accent: "blue",
      title: `${asPercent(data.completion.rate)}% completion`,
      body: `${data.completion.done} of ${data.completion.due} due days marked in this range.`,
    },
  ];

  if (data.bestStreak) {
    insights.push({
      id: "streak",
      accent: "flame",
      title: `${data.bestStreak.title} leads`,
      body: `Best chain in this range is ${data.bestStreak.length} days.`,
    });
  }

  if (weekdays.length > 0 && strongest.name !== weakest.name) {
    insights.push({
      id: "week",
      accent: "quiet",
      title: `${strongest.name} is strongest`,
      body: `${weakest.name} is the weak spot. Guard that day.`,
    });
  }

  return insights.slice(0, 3);
}

export function habitStatsWeekdayRates(stats: HabitStatsResponse): number[] {
  return weekdayRatesInOrder(stats.byWeekday);
}

export function isLogMarked(status: LogStatus | undefined | null) {
  return status === "DONE" || status === "PARTIAL";
}

import type { DueHabit, RestHabit } from "@/components/today/sample-data";
import type { Reminder, TodayHabitItem, TodayNotDueItem } from "@/lib/api/types";
import { addDaysIso, formatPrettyIso } from "@/lib/dates";
import { normalizeHabitIcon } from "@/lib/habits/icon";
import { tintFromApiColor } from "@/lib/habits/map";

function formatNextDue(iso: string | null, today: string) {
  if (!iso) return "Unscheduled";
  if (iso === addDaysIso(today, 1)) return "Due tomorrow";
  if (iso === today) return "Due today";
  return `Next ${formatPrettyIso(iso, { weekday: "short", day: "numeric", month: "short" })}`;
}

export function toDueHabit(
  item: TodayHabitItem,
  reminderTime?: string,
): DueHabit {
  const marked =
    item.log?.status === "DONE" || item.log?.status === "PARTIAL";

  return {
    id: item.id,
    title: item.title,
    emoji: normalizeHabitIcon(item.icon),
    tint: tintFromApiColor(item.color),
    done: marked,
    streakDays: item.streak.current,
    schedule: { kind: "custom", label: item.schedule },
    quantity:
      item.targetValue != null
        ? {
            current: item.log?.value ?? (marked ? item.targetValue : 0),
            target: item.targetValue,
            unit: item.unit || "",
          }
        : undefined,
    reminder: reminderTime,
  };
}

export function toRestHabit(item: TodayNotDueItem, today: string): RestHabit {
  return {
    id: item.id,
    title: item.title,
    emoji: normalizeHabitIcon(item.icon),
    tint: "var(--blue-soft)",
    scheduleLabel: item.schedule,
    nextLabel: formatNextDue(item.nextDueDate, today),
  };
}

export function reminderTimeForHabit(
  groups: Array<{ habitId: string; reminders: Reminder[] }> | undefined,
  habitId: string,
): string | undefined {
  const group = groups?.find((item) => item.habitId === habitId);
  const enabled = group?.reminders.find((reminder) => reminder.enabled);
  return enabled?.timeLocal;
}

export function coachingLine(
  remaining: number,
  openTitle?: string,
  streakDays?: number,
) {
  if (remaining === 0) {
    return "You showed up for every habit today. Nice work.";
  }
  if (openTitle && streakDays && streakDays > 0) {
    return `${remaining} left — keep your “${openTitle}” streak going.`;
  }
  if (openTitle) {
    return remaining === 1
      ? `One left: ${openTitle}. You’ve got this.`
      : `${remaining} left. Start with ${openTitle}.`;
  }
  return remaining === 1
    ? "One habit left for today."
    : `${remaining} habits still open — small steps count.`;
}

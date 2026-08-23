import type {
  ColorId,
  HabitType,
  ScheduleMode,
} from "@/components/habits/schedule-utils";
import type { AiHabitIdea, AiSuggestion } from "@/lib/api/types";

export function suggestionAccent(
  category: AiSuggestion["category"],
): "flame" | "blue" | "quiet" {
  if (category === "motivation") return "flame";
  if (category === "habit") return "blue";
  return "quiet";
}

export type AiHabitIdeaPrefill = {
  name: string;
  note: string;
  icon: string;
  habitType: HabitType;
  scheduleMode: ScheduleMode;
  weekdays: number[];
  timesPerWeek: number;
  intervalDays: number;
  colorId: ColorId;
};

export function prefillFromAiHabitIdea(idea: AiHabitIdea): AiHabitIdeaPrefill {
  let scheduleMode: ScheduleMode = "daily";
  let weekdays = [1, 2, 3, 4, 5];
  let timesPerWeek = 3;
  let intervalDays = 3;

  switch (idea.scheduleType) {
    case "SPECIFIC_DAYS":
      scheduleMode = "weekdays";
      break;
    case "TIMES_PER_WEEK":
      scheduleMode = "times_per_week";
      timesPerWeek = 3;
      break;
    case "INTERVAL":
      scheduleMode = "interval";
      intervalDays = 3;
      break;
    default:
      scheduleMode = "daily";
  }

  return {
    name: idea.title,
    note: `${idea.description} ${idea.reason}`.trim(),
    icon: idea.icon || "✓",
    habitType: idea.type === "BREAK" ? "quitting" : "building",
    scheduleMode,
    weekdays,
    timesPerWeek,
    intervalDays,
    colorId: idea.type === "BREAK" ? "flame" : "blue",
  };
}

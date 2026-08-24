import type {
  ColorId,
  HabitType,
  ScheduleMode,
} from "@/components/habits/schedule-utils";
import { todayIsoDate } from "@/components/habits/schedule-utils";
import { COLOR_HEX, toCreateHabitRequest } from "@/lib/habits/map";
import { normalizeHabitIcon } from "@/lib/habits/icon";
import type {
  AiCreatedHabitDraft,
  AiHabitIdea,
  AiPromptFeature,
  AiSuggestion,
} from "@/lib/api/types";
import type { CreateHabitRequest } from "@/lib/api/types";

export function suggestionAccent(
  category: AiSuggestion["category"],
): "flame" | "blue" | "quiet" {
  if (category === "motivation") return "flame";
  if (category === "habit") return "blue";
  return "quiet";
}

export { normalizeHabitIcon as normalizeAiHabitIcon } from "@/lib/habits/icon";

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

function colorIdFromHex(hex: string | undefined): ColorId {
  if (!hex) return "blue";
  const normalized = hex.trim().toUpperCase();
  const match = (Object.entries(COLOR_HEX) as [ColorId, string][]).find(
    ([, value]) => value.toUpperCase() === normalized,
  );
  return match?.[0] ?? "blue";
}

function scheduleFromApi(
  scheduleType: AiHabitIdea["scheduleType"] | AiCreatedHabitDraft["scheduleType"],
  scheduleDays?: number[],
  targetPerWeek?: number | null,
  intervalDays?: number | null,
): Pick<
  AiHabitIdeaPrefill,
  "scheduleMode" | "weekdays" | "timesPerWeek" | "intervalDays"
> {
  switch (scheduleType) {
    case "SPECIFIC_DAYS":
      return {
        scheduleMode: "weekdays",
        weekdays:
          scheduleDays && scheduleDays.length > 0
            ? [...scheduleDays].sort((a, b) => a - b)
            : [1, 2, 3, 4, 5],
        timesPerWeek: 3,
        intervalDays: 3,
      };
    case "TIMES_PER_WEEK":
      return {
        scheduleMode: "times_per_week",
        weekdays: [1, 2, 3, 4, 5],
        timesPerWeek: targetPerWeek ?? 3,
        intervalDays: 3,
      };
    case "INTERVAL":
      return {
        scheduleMode: "interval",
        weekdays: [1, 2, 3, 4, 5],
        timesPerWeek: 3,
        intervalDays: intervalDays ?? 3,
      };
    default:
      return {
        scheduleMode: "daily",
        weekdays: [1, 2, 3, 4, 5],
        timesPerWeek: 3,
        intervalDays: 3,
      };
  }
}

export function prefillFromAiHabitIdea(idea: AiHabitIdea): AiHabitIdeaPrefill {
  const schedule = scheduleFromApi(idea.scheduleType);
  return {
    name: idea.title,
    note: `${idea.description} ${idea.reason}`.trim(),
    icon: normalizeHabitIcon(idea.icon),
    habitType: idea.type === "BREAK" ? "quitting" : "building",
    ...schedule,
    colorId: idea.type === "BREAK" ? "flame" : "blue",
  };
}

export function prefillFromAiCreatedHabit(
  draft: AiCreatedHabitDraft,
  reason?: string,
): AiHabitIdeaPrefill {
  const schedule = scheduleFromApi(
    draft.scheduleType,
    draft.scheduleDays,
    draft.targetPerWeek,
    draft.intervalDays,
  );
  return {
    name: draft.title,
    note: [draft.description, reason].filter(Boolean).join(" ").trim(),
    icon: normalizeHabitIcon(draft.icon),
    habitType: draft.type === "BREAK" ? "quitting" : "building",
    ...schedule,
    colorId: colorIdFromHex(draft.color),
  };
}

export function toCreateHabitRequestFromAiDraft(
  draft: AiCreatedHabitDraft,
  reason?: string,
): CreateHabitRequest {
  const prefill = prefillFromAiCreatedHabit(draft, reason);
  return toCreateHabitRequest({
    title: prefill.name,
    note: prefill.note,
    icon: prefill.icon,
    colorId: prefill.colorId,
    habitType: prefill.habitType,
    schedule: {
      mode: prefill.scheduleMode,
      weekdays: prefill.weekdays,
      timesPerWeek: prefill.timesPerWeek,
      intervalDays: prefill.intervalDays,
      startDate: draft.startDate || todayIsoDate(),
    },
    measureTarget: "",
    measureUnit: "",
  });
}

export const AI_HABIT_PREFILL_KEY = "momentum-ai-habit-prefill";

export function stashAiHabitPrefill(prefill: AiHabitIdeaPrefill) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AI_HABIT_PREFILL_KEY, JSON.stringify(prefill));
}

export const AI_PROMPT_FEATURES: Array<{
  id: AiPromptFeature;
  label: string;
  vars: string;
}> = [
  {
    id: "chat",
    label: "Chat",
    vars: "{{userName}} {{today}} {{habits}} {{habitTitle}} {{history}} {{message}}",
  },
  {
    id: "generate_habit",
    label: "Generate habit",
    vars: "{{userName}} {{goal}} {{interests}} {{habits}} {{count}}",
  },
  {
    id: "create_habit",
    label: "Create habit",
    vars: "{{userName}} {{today}} {{message}} {{goal}} {{habits}}",
  },
  {
    id: "suggestions",
    label: "Suggestions",
    vars: "{{userName}} {{today}} {{focus}} {{prompt}} {{habits}}",
  },
  {
    id: "habit_message",
    label: "Habit message",
    vars: "{{habitTitle}} {{habitType}} {{scheduleType}} {{context}} {{streak}} {{loggedToday}}",
  },
];

export function aiPromptFeatureLabel(feature: AiPromptFeature) {
  return AI_PROMPT_FEATURES.find((item) => item.id === feature)?.label ?? feature;
}

export function aiPromptStatusLabel(status: string) {
  if (status === "published") return "Published";
  if (status === "archived") return "Archived";
  return "Draft";
}

export function aiPromptStatusChip(status: string) {
  if (status === "published") return "chip chip-blue";
  if (status === "archived") return "chip chip-quiet";
  return "chip chip-flame";
}

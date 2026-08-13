export type ScheduleMode =
  | "daily"
  | "weekdays"
  | "times_per_week"
  | "interval";

export type HabitType = "building" | "quitting";

export const ICON_OPTIONS = ["📖", "🏋️", "💧", "🧘", "✍️", "🗣️", "🚫"] as const;

export const COLOR_OPTIONS = [
  { id: "blue", label: "Blue", tint: "var(--blue-soft)" },
  { id: "flame", label: "Flame", tint: "var(--flame-soft)" },
  { id: "purple", label: "Purple", tint: "#efe8fb" },
  { id: "green", label: "Green", tint: "#e8f5ee" },
  { id: "gold", label: "Gold", tint: "#fff4db" },
] as const;

export type ColorId = (typeof COLOR_OPTIONS)[number]["id"];

/** Display order: Sat → Fri */
export const WEEKDAY_OPTIONS = [
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
] as const;

export const PREVIEW_WEEKS = 8;
export const PREVIEW_DAYS = 7;
export const PREVIEW_TOTAL = PREVIEW_WEEKS * PREVIEW_DAYS;

export type ScheduleInput = {
  mode: ScheduleMode;
  weekdays: number[];
  timesPerWeek: number;
  intervalDays: number;
  startDate: string;
};

export function tintForColor(colorId: ColorId): string {
  return COLOR_OPTIONS.find((c) => c.id === colorId)?.tint ?? "var(--blue-soft)";
}

export function formatScheduleLabel(
  input: ScheduleInput,
  habitType: HabitType,
): string {
  let base: string;
  switch (input.mode) {
    case "daily":
      base = "Every day";
      break;
    case "weekdays": {
      if (input.weekdays.length === 7) {
        base = "Every day";
        break;
      }
      const ordered = WEEKDAY_OPTIONS.filter((d) =>
        input.weekdays.includes(d.value),
      ).map((d) => d.label);
      base = ordered.length ? ordered.join(" · ") : "Pick weekdays";
      break;
    }
    case "times_per_week":
      base = `${input.timesPerWeek}× per week`;
      break;
    case "interval":
      base = `Every ${input.intervalDays} days`;
      break;
  }
  if (habitType === "quitting") {
    return `${base} · quitting`;
  }
  return base;
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dayDiff(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / 86_400_000);
}

/** Sequential day grid: index = week × 7 + row, date = today + index. */
export function computeDueGrid(input: ScheduleInput): boolean[] {
  const start = parseLocalDate(input.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: PREVIEW_TOTAL }, (_, index) => {
    const cellDate = addDays(today, index);
    if (cellDate < start) return false;

    switch (input.mode) {
      case "daily":
        return true;
      case "weekdays":
        return input.weekdays.includes(cellDate.getDay());
      case "times_per_week":
        return true;
      case "interval": {
        const diff = dayDiff(start, cellDate);
        return diff >= 0 && diff % input.intervalDays === 0;
      }
      default:
        return false;
    }
  });
}

export function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function measureMeta(target: string, unit: string): string | null {
  const t = target.trim();
  const u = unit.trim();
  if (!t || !u) return null;
  return `${t} ${u}`;
}

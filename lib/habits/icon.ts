import { ICON_OPTIONS } from "@/components/habits/schedule-utils";

const ICON_ALIASES: Record<string, string> = {
  check: ICON_OPTIONS[0],
  tick: ICON_OPTIONS[0],
  checkmark: ICON_OPTIONS[0],
  book: ICON_OPTIONS[0],
  read: ICON_OPTIONS[0],
  reading: ICON_OPTIONS[0],
  fitness: ICON_OPTIONS[1],
  gym: ICON_OPTIONS[1],
  workout: ICON_OPTIONS[1],
  water: ICON_OPTIONS[2],
  hydrate: ICON_OPTIONS[2],
  meditate: ICON_OPTIONS[3],
  meditation: ICON_OPTIONS[3],
  yoga: ICON_OPTIONS[3],
  write: ICON_OPTIONS[4],
  journal: ICON_OPTIONS[4],
  speak: ICON_OPTIONS[5],
  talk: ICON_OPTIONS[5],
  quit: ICON_OPTIONS[6],
  stop: ICON_OPTIONS[6],
};

/** True when the value is safe to render as emoji text (not a plain word). */
export function isHabitEmoji(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (ICON_OPTIONS.includes(trimmed as (typeof ICON_OPTIONS)[number])) {
    return true;
  }
  return !/^[a-z0-9_-]+$/i.test(trimmed);
}

/** Map AI / API icon strings to a bounded emoji from our set. */
export function normalizeHabitIcon(icon: string | undefined | null): string {
  const trimmed = icon?.trim();
  if (!trimmed) return ICON_OPTIONS[0];

  if (ICON_OPTIONS.includes(trimmed as (typeof ICON_OPTIONS)[number])) {
    return trimmed;
  }

  const alias = ICON_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;

  if (isHabitEmoji(trimmed)) return trimmed;

  return ICON_OPTIONS[0];
}

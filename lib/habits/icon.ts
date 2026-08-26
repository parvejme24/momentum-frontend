import {
  HABIT_ICON_OPTIONS,
  type HabitIcon,
} from "@/lib/habits/icon-options";

const DEFAULT_ICON = HABIT_ICON_OPTIONS[0];

const ICON_ALIASES: Record<string, HabitIcon> = {
  check: "✅",
  tick: "✅",
  checkmark: "✅",
  book: "📖",
  read: "📖",
  reading: "📖",
  study: "📚",
  learn: "🧠",
  fitness: "🏋️",
  gym: "🏋️",
  workout: "🏋️",
  water: "💧",
  hydrate: "💧",
  meditate: "🧘",
  meditation: "🧘",
  yoga: "🧘",
  write: "✍️",
  journal: "📓",
  speak: "🗣️",
  talk: "🗣️",
  quit: "🚫",
  stop: "🚫",
  run: "🏃",
  running: "🏃",
  walk: "🚶",
  walking: "🚶",
  sleep: "🛏️",
  bed: "🛏️",
  eat: "🍎",
  apple: "🍎",
  healthy: "🥗",
  food: "🍽️",
  focus: "🎯",
  target: "🎯",
  goal: "🎯",
  medicine: "💊",
  pill: "💊",
  vitamins: "💊",
  clean: "🧹",
  cleaning: "🧹",
  music: "🎸",
  guitar: "🎸",
  phone: "📱",
  screen: "📵",
  smoke: "🚭",
  smoking: "🚭",
  strength: "💪",
  muscle: "💪",
  cycle: "🚴",
  bike: "🚴",
  cycling: "🚴",
  plan: "📝",
  note: "📝",
  list: "📋",
  art: "🎨",
  creative: "🎨",
  paint: "🖌️",
  nature: "🌿",
  plant: "🪴",
  wake: "⏰",
  alarm: "⏰",
  meal: "🥗",
  salad: "🥗",
  rest: "💤",
  nap: "😴",
  sun: "☀️",
  morning: "🌅",
  coffee: "☕",
  tea: "🍵",
  swim: "🏊",
  code: "💻",
  coding: "🧑‍💻",
  work: "💼",
  money: "💰",
  save: "🏦",
  dog: "🐕",
  cat: "🐈",
  game: "🎮",
  tv: "📺",
  shop: "🛒",
  home: "🏠",
  shower: "🚿",
  teeth: "🪥",
};

/** True when the value is safe to render as emoji text (not a plain word). */
export function isHabitEmoji(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (HABIT_ICON_OPTIONS.includes(trimmed as HabitIcon)) {
    return true;
  }
  return !/^[a-z0-9_-]+$/i.test(trimmed);
}

/** Map AI / API icon strings to a bounded emoji from our set. */
export function normalizeHabitIcon(icon: string | undefined | null): string {
  const trimmed = icon?.trim();
  if (!trimmed) return DEFAULT_ICON;

  if (HABIT_ICON_OPTIONS.includes(trimmed as HabitIcon)) {
    return trimmed;
  }

  const alias = ICON_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;

  if (isHabitEmoji(trimmed)) return trimmed;

  return DEFAULT_ICON;
}

export { HABIT_ICON_OPTIONS as ICON_OPTIONS };

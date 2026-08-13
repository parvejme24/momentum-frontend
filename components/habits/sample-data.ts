export type HabitCategory = "building" | "quitting" | "at-risk";

export type LibraryHabit = {
  id: string;
  title: string;
  emoji: string;
  tint: string;
  categories: HabitCategory[];
  schedule: string;
  detail?: string;
  streakDays: number;
  streakLabel?: string;
  rate?: number;
  bestLabel?: string;
  /** Weekday rows that count (0=Sun … 6=Sat). Omit = every day. */
  activeWeekdays?: number[];
  brokenLabel?: string;
  heatSeed: number;
  fillRate: number;
};

export type ArchivedHabit = {
  id: string;
  title: string;
  emoji: string;
  tint: string;
  schedule: string;
  rate: number;
  bestLabel: string;
  archivedAt: string;
  heatSeed: number;
  fillRate: number;
};

export const ACTIVE_HABITS: LibraryHabit[] = [
  {
    id: "read",
    title: "Read 30 pages",
    emoji: "📖",
    tint: "var(--blue-soft)",
    categories: ["building"],
    schedule: "Every day",
    detail: "30 pages",
    streakDays: 47,
    rate: 86,
    bestLabel: "best 61",
    heatSeed: 101,
    fillRate: 0.86,
  },
  {
    id: "english",
    title: "English speaking practice",
    emoji: "🗣️",
    tint: "#e8f5ee",
    categories: ["building"],
    schedule: "Every day",
    detail: "20 minutes",
    streakDays: 12,
    rate: 74,
    bestLabel: "best 34",
    heatSeed: 202,
    fillRate: 0.74,
  },
  {
    id: "strength",
    title: "Strength training",
    emoji: "🏋️",
    tint: "#efe8fb",
    categories: ["building"],
    schedule: "Sat · Mon · Wed",
    streakDays: 8,
    rate: 68,
    bestLabel: "best 15",
    activeWeekdays: [1, 3, 6],
    heatSeed: 303,
    fillRate: 0.68,
  },
  {
    id: "water",
    title: "Drink 3L water",
    emoji: "💧",
    tint: "#e4f2ff",
    categories: ["building", "at-risk"],
    schedule: "Every day",
    detail: "3 litres",
    streakDays: 0,
    brokenLabel: "Chain broken 2 days ago",
    heatSeed: 404,
    fillRate: 0.48,
  },
  {
    id: "journal",
    title: "Write dev journal",
    emoji: "✍️",
    tint: "#fff4db",
    categories: ["building"],
    schedule: "4× per week",
    streakDays: 35,
    streakLabel: "5w",
    rate: 71,
    bestLabel: "best 9 weeks",
    heatSeed: 505,
    fillRate: 0.71,
  },
  {
    id: "scroll",
    title: "No scrolling before noon",
    emoji: "📵",
    tint: "var(--flame-soft)",
    categories: ["quitting"],
    schedule: "Every day",
    detail: "quitting",
    streakDays: 19,
    rate: 81,
    bestLabel: "best 19",
    heatSeed: 606,
    fillRate: 0.81,
  },
];

export const INITIAL_ARCHIVED: ArchivedHabit[] = [
  {
    id: "shower",
    title: "Morning cold shower",
    emoji: "🚿",
    tint: "var(--rule)",
    schedule: "Every day",
    rate: 62,
    bestLabel: "best 21",
    archivedAt: "3 Feb 2026",
    heatSeed: 701,
    fillRate: 0.62,
  },
  {
    id: "spanish",
    title: "Learn 5 Spanish words",
    emoji: "🇪🇸",
    tint: "#fff4db",
    schedule: "Weekdays",
    rate: 55,
    bestLabel: "best 14",
    archivedAt: "18 Dec 2025",
    heatSeed: 802,
    fillRate: 0.55,
  },
];

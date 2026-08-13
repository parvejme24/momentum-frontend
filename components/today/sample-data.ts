export type HabitSchedule =
  | { kind: "daily"; label: string }
  | { kind: "weekly"; label: string }
  | { kind: "quit"; label: string }
  | { kind: "custom"; label: string };

export type DueHabit = {
  id: string;
  title: string;
  emoji: string;
  tint: string;
  done: boolean;
  streakDays: number;
  streakLabel?: string;
  schedule: HabitSchedule;
  quantity?: { current: number; target: number; unit: string };
  reminder?: string;
  weekProgress?: string;
};

export type RestHabit = {
  id: string;
  title: string;
  emoji: string;
  tint: string;
  scheduleLabel: string;
  nextLabel: string;
};

export const INITIAL_DUE: DueHabit[] = [
  {
    id: "read",
    title: "Read 30 pages",
    emoji: "📖",
    tint: "var(--blue-soft)",
    done: true,
    streakDays: 47,
    schedule: { kind: "daily", label: "Every day" },
    quantity: { current: 32, target: 30, unit: "pages" },
  },
  {
    id: "english",
    title: "English speaking practice",
    emoji: "🗣️",
    tint: "#e8f5ee",
    done: true,
    streakDays: 12,
    schedule: { kind: "daily", label: "Every day" },
    quantity: { current: 20, target: 20, unit: "min" },
  },
  {
    id: "scroll",
    title: "No scrolling before noon",
    emoji: "📵",
    tint: "var(--flame-soft)",
    done: true,
    streakDays: 19,
    schedule: { kind: "quit", label: "Quitting" },
  },
  {
    id: "strength",
    title: "Strength training",
    emoji: "🏋️",
    tint: "#efe8fb",
    done: false,
    streakDays: 8,
    schedule: { kind: "weekly", label: "Sat · Mon · Wed" },
    reminder: "17:00",
  },
  {
    id: "journal",
    title: "Write dev journal",
    emoji: "✍️",
    tint: "#fff4db",
    done: false,
    streakDays: 35,
    streakLabel: "5 weeks",
    schedule: { kind: "custom", label: "4× per week" },
    weekProgress: "2 done",
  },
  {
    id: "water",
    title: "Drink 3L water",
    emoji: "💧",
    tint: "#e4f2ff",
    done: false,
    streakDays: 0,
    schedule: { kind: "daily", label: "Every day" },
    quantity: { current: 0, target: 3, unit: "litres" },
  },
];

export const REST_HABITS: RestHabit[] = [
  {
    id: "meditation",
    title: "Long meditation",
    emoji: "🧘",
    tint: "var(--rule)",
    scheduleLabel: "Friday only",
    nextLabel: "Next in 2 days",
  },
];

/** Share of due days completed for the last 12 weeks (oldest → newest). */
export const WEEK_RATES = [0.42, 0.55, 0.48, 0.61, 0.7, 0.58, 0.74, 0.81, 0.69, 0.86, 0.78, 0.91];

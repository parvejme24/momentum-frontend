export type RangeKey = "7d" | "30d" | "90d" | "all";

export const RANGE_TABS: { id: RangeKey; label: string }[] = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "all", label: "All time" },
];

export type SummaryTile = {
  key: string;
  value: string;
  note: string;
  flame?: boolean;
};

export type HabitCompare = {
  id: string;
  title: string;
  emoji: string;
  tint: string;
  rate: number;
  heatSeed: number;
  fillRate: number;
  activeWeekdays?: number[];
};

export type Milestone = {
  id: string;
  emoji: string;
  tint: string;
  title: string;
  detail: string;
  when: string;
};

export type Insight = {
  id: string;
  accent: "flame" | "blue" | "quiet";
  title: string;
  body: string;
};

const WEEK_12_BASE = [
  0.42, 0.55, 0.48, 0.61, 0.7, 0.58, 0.74, 0.81, 0.69, 0.86, 0.78, 0.91,
];

const WEEKDAY_BASE = [0.78, 0.88, 0.84, 0.82, 0.8, 0.58, 0.72];

export function consistencyRates(range: RangeKey): number[] {
  const shift =
    range === "7d" ? 0.06 : range === "30d" ? 0.03 : range === "all" ? -0.02 : 0;
  return WEEK_12_BASE.map((r) => Math.min(0.98, Math.max(0.2, r + shift)));
}

export function weekdayRates(range: RangeKey): number[] {
  const shift =
    range === "7d" ? 0.04 : range === "30d" ? 0.02 : range === "all" ? -0.01 : 0;
  return WEEKDAY_BASE.map((r) => Math.min(0.98, Math.max(0.2, r + shift)));
}

export function summaryForRange(range: RangeKey): SummaryTile[] {
  const byRange: Record<RangeKey, SummaryTile[]> = {
    "7d": [
      { key: "Days tracked", value: "7", note: "this week" },
      { key: "Overall rate", value: "84%", note: "of all due days" },
      {
        key: "Best chain",
        value: "61",
        note: "Read 30 pages",
        flame: true,
      },
      { key: "Perfect days", value: "3", note: "everything marked" },
    ],
    "30d": [
      { key: "Days tracked", value: "30", note: "this month" },
      { key: "Overall rate", value: "81%", note: "of all due days" },
      {
        key: "Best chain",
        value: "61",
        note: "Read 30 pages",
        flame: true,
      },
      { key: "Perfect days", value: "12", note: "everything marked" },
    ],
    "90d": [
      { key: "Days tracked", value: "90", note: "this range" },
      { key: "Overall rate", value: "79%", note: "of all due days" },
      {
        key: "Best chain",
        value: "61",
        note: "Read 30 pages",
        flame: true,
      },
      { key: "Perfect days", value: "28", note: "everything marked" },
    ],
    all: [
      { key: "Days tracked", value: "358", note: "since you started" },
      { key: "Overall rate", value: "79%", note: "of all due days" },
      {
        key: "Best chain",
        value: "61",
        note: "Read 30 pages",
        flame: true,
      },
      { key: "Perfect days", value: "94", note: "everything marked" },
    ],
  };
  return byRange[range];
}

export const COMPARE_HABITS: HabitCompare[] = [
  {
    id: "read",
    title: "Read 30 pages",
    emoji: "📖",
    tint: "var(--blue-soft)",
    rate: 86,
    heatSeed: 101,
    fillRate: 0.86,
  },
  {
    id: "english",
    title: "English practice",
    emoji: "🗣️",
    tint: "#e8f5ee",
    rate: 74,
    heatSeed: 202,
    fillRate: 0.74,
  },
  {
    id: "strength",
    title: "Strength training",
    emoji: "🏋️",
    tint: "#efe8fb",
    rate: 68,
    heatSeed: 303,
    fillRate: 0.68,
    activeWeekdays: [1, 3, 6],
  },
  {
    id: "water",
    title: "Drink 3L water",
    emoji: "💧",
    tint: "#e4f2ff",
    rate: 52,
    heatSeed: 404,
    fillRate: 0.52,
  },
  {
    id: "journal",
    title: "Write dev journal",
    emoji: "✍️",
    tint: "#fff4db",
    rate: 71,
    heatSeed: 505,
    fillRate: 0.71,
  },
  {
    id: "scroll",
    title: "No morning scrolling",
    emoji: "📵",
    tint: "var(--flame-soft)",
    rate: 81,
    heatSeed: 606,
    fillRate: 0.81,
  },
];

export const MILESTONES: Milestone[] = [
  {
    id: "m1",
    emoji: "🏆",
    tint: "var(--flame-soft)",
    title: "45 days of reading",
    detail: "Longest run this year",
    when: "2d ago",
  },
  {
    id: "m2",
    emoji: "📅",
    tint: "var(--blue-soft)",
    title: "A perfect week",
    detail: "Every due day marked, 7 days straight",
    when: "1w ago",
  },
  {
    id: "m3",
    emoji: "🚫",
    tint: "#efe8fb",
    title: "Two weeks off the morning scroll",
    detail: "First quitting habit past 14 days",
    when: "5d ago",
  },
  {
    id: "m4",
    emoji: "📖",
    tint: "#fff4db",
    title: "9,000 pages logged",
    detail: "Roughly 30 books",
    when: "3w ago",
  },
];

export const INSIGHTS: Insight[] = [
  {
    id: "i1",
    accent: "flame",
    title: "Friday is costing you three habits",
    body: "Reading, water, and journalling drop below 62% on Fridays; other weekdays sit above 80%. Lower Friday targets before you add anything new.",
  },
  {
    id: "i2",
    accent: "blue",
    title: "Water is the one to fix first",
    body: "At 52%, it’s the only habit below 65% — four broken chains this quarter. Treat it as a target problem, not a willpower one.",
  },
  {
    id: "i3",
    accent: "quiet",
    title: "Six habits is near your ceiling",
    body: "You held 86% with four habits and 79% with six. A seventh will cost more consistency than it gains.",
  },
];

export const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

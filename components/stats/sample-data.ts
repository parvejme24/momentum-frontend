import customer from "@/data/customer.json";

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

const WEEK_12_BASE = customer.stats.week12Base;
const WEEKDAY_BASE = customer.stats.weekdayBase;

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
  return customer.stats.summaryByRange[range] as SummaryTile[];
}

export const COMPARE_HABITS: HabitCompare[] =
  customer.stats.compareHabits as HabitCompare[];

export const MILESTONES: Milestone[] = customer.stats.milestones as Milestone[];

export const INSIGHTS: Insight[] = customer.stats.insights as Insight[];

export const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

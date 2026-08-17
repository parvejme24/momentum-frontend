import customer from "@/data/customer.json";

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

export const ACTIVE_HABITS: LibraryHabit[] = customer.habits.active as LibraryHabit[];

export const INITIAL_ARCHIVED: ArchivedHabit[] =
  customer.habits.archived as ArchivedHabit[];

import customer from "@/data/customer.json";

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

export const INITIAL_DUE: DueHabit[] = customer.today.due as DueHabit[];

export const REST_HABITS: RestHabit[] = customer.today.rest as RestHabit[];

/** Share of due days completed for the last 12 weeks (oldest → newest). */
export const WEEK_RATES = customer.today.weekRates;

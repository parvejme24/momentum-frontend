export const todayKeys = {
  all: ["today"] as const,
  date: (date?: string) => [...todayKeys.all, { date: date ?? "now" }] as const,
};

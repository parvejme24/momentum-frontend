export const logKeys = {
  all: ["logs"] as const,
  habitRoot: (habitId: string) => [...logKeys.all, "habit", habitId] as const,
  habit: (habitId: string, from: string, to: string) =>
    [...logKeys.habitRoot(habitId), { from, to }] as const,
};

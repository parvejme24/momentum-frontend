export const logKeys = {
  all: ["logs"] as const,
  habit: (habitId: string, from: string, to: string) =>
    [...logKeys.all, "habit", habitId, { from, to }] as const,
};

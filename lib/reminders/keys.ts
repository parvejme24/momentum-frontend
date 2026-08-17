export const reminderKeys = {
  all: ["reminders"] as const,
  grouped: () => [...reminderKeys.all, "grouped"] as const,
  habit: (habitId: string) => [...reminderKeys.all, "habit", habitId] as const,
};

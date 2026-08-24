/** True when the user message looks like a habit-creation prompt. */
export function wantsCreateHabit(message: string, createMode = false): boolean {
  if (createMode) return true;

  const text = message.trim().toLowerCase();
  if (!text) return false;

  const patterns = [
    /\b(create|add|make|start|build|set up|setup)\b.*\b(habit|routine)\b/,
    /\b(habit|routine)\b.*\b(for|to|where|that)\b/,
    /^i want to\b/,
    /^help me (create|start|build|track)\b/,
    /^new habit\b/,
    /^track\b.+\b(every|daily|weekly|morning|evening|night)\b/,
    /\bevery (day|morning|evening|night|week)\b/,
  ];

  return patterns.some((pattern) => pattern.test(text));
}

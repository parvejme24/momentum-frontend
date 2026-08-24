export const aiKeys = {
  all: ["ai"] as const,
  status: () => ["ai", "status"] as const,
  features: () => ["ai", "features"] as const,
  suggestions: (focus: string) => ["ai", "suggestions", focus] as const,
};

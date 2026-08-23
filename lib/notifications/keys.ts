export const notificationKeys = {
  all: ["notifications"] as const,
  list: (audience: string, query: Record<string, unknown> = {}) =>
    ["notifications", audience, "list", query] as const,
  unread: (audience: string) =>
    ["notifications", audience, "unread"] as const,
};

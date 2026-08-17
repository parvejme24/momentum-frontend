export const deviceKeys = {
  all: ["devices"] as const,
  list: () => [...deviceKeys.all, "list"] as const,
};

export const habitKeys = {
  all: ["habits"] as const,
  lists: () => [...habitKeys.all, "list"] as const,
  list: (archived = false) => [...habitKeys.lists(), { archived }] as const,
  details: () => [...habitKeys.all, "detail"] as const,
  detail: (id: string) => [...habitKeys.details(), id] as const,
};

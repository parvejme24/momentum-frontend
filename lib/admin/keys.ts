import type {
  ListAdminPaymentsQuery,
  ListAdminSubscriptionsQuery,
  ListAdminUsersQuery,
  RevenueQuery,
} from "@/lib/api/types";

export const adminKeys = {
  all: ["admin"] as const,
  users: {
    all: ["admin", "users"] as const,
    list: (query: ListAdminUsersQuery = {}) =>
      ["admin", "users", "list", query] as const,
    detail: (id: string) => ["admin", "users", "detail", id] as const,
  },
  subscriptions: {
    all: ["admin", "subscriptions"] as const,
    list: (query: ListAdminSubscriptionsQuery = {}) =>
      ["admin", "subscriptions", "list", query] as const,
    detail: (id: string) => ["admin", "subscriptions", "detail", id] as const,
  },
  payments: {
    all: ["admin", "payments"] as const,
    list: (query: ListAdminPaymentsQuery = {}) =>
      ["admin", "payments", "list", query] as const,
    detail: (id: string) => ["admin", "payments", "detail", id] as const,
    revenue: (query: RevenueQuery = {}) =>
      ["admin", "payments", "revenue", query] as const,
  },
  plans: {
    all: ["admin", "plans"] as const,
    list: (status = "all") => ["admin", "plans", "list", status] as const,
    detail: (id: string) => ["admin", "plans", "detail", id] as const,
  },
};

/** @deprecated Use adminKeys.users */
export const adminUserKeys = adminKeys.users;

/**
 * Express mounts:
 *   /api
 *   /v1/auth
 *   /v1/habits
 *   /v1/logs
 *   /v1/today
 *   /v1/stats
 *   /v1/reminders
 *   /v1/devices
 *   /v1/pricing
 *   /v1/billing
 *   /v1/ai
 *   /v1/notifications
 *   /v1/admin/users
 *   /v1/admin/subscriptions
 *   /v1/admin/payments
 *   /v1/admin/revenue
 *   /v1/admin/pricing
 *   /v1/admin/notifications
 *
 * Env vars are the origin only (e.g. http://localhost:4000).
 * Trailing /v1 or /api/v1 from older env files is stripped.
 */
export const API_PREFIX = {
  api: "/api",
  auth: "/v1/auth",
  habits: "/v1/habits",
  logs: "/v1/logs",
  today: "/v1/today",
  stats: "/v1/stats",
  reminders: "/v1/reminders",
  devices: "/v1/devices",
  pricing: "/v1/pricing",
  billing: "/v1/billing",
  ai: "/v1/ai",
  notifications: "/v1/notifications",
  adminPricing: "/v1/admin/pricing",
  adminUsers: "/v1/admin/users",
  adminSubscriptions: "/v1/admin/subscriptions",
  adminPayments: "/v1/admin/payments",
  adminRevenue: "/v1/admin/revenue",
  adminNotifications: "/v1/admin/notifications",
} as const;

export function normalizeApiOrigin(raw: string): string {
  return raw.replace(/\/$/, "").replace(/\/(api\/)?v1$/i, "");
}

export function getApiOrigin(): string {
  const raw =
    process.env.BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!raw) {
    throw new Error("BACKEND_URL or NEXT_PUBLIC_API_URL is not configured");
  }

  return normalizeApiOrigin(raw);
}

/** @deprecated Use getApiOrigin() */
export function getBackendUrl(): string {
  return getApiOrigin();
}

function withSuffix(prefix: string, suffix = ""): string {
  const slug = suffix.replace(/^\//, "");
  return slug ? `${prefix}/${slug}` : prefix;
}

export function authPath(action: string): string {
  return withSuffix(API_PREFIX.auth, action);
}

export function habitPath(suffix = ""): string {
  return withSuffix(API_PREFIX.habits, suffix);
}

export function todayPath(suffix = ""): string {
  return withSuffix(API_PREFIX.today, suffix);
}

export function logsPath(suffix = ""): string {
  return withSuffix(API_PREFIX.logs, suffix);
}

export function statsPath(suffix = ""): string {
  return withSuffix(API_PREFIX.stats, suffix);
}

export function reminderPath(suffix = ""): string {
  return withSuffix(API_PREFIX.reminders, suffix);
}

export function devicePath(suffix = ""): string {
  return withSuffix(API_PREFIX.devices, suffix);
}

export function pricingPath(suffix = ""): string {
  return withSuffix(API_PREFIX.pricing, suffix);
}

export function billingPath(suffix = ""): string {
  return withSuffix(API_PREFIX.billing, suffix);
}

export function aiPath(suffix = ""): string {
  return withSuffix(API_PREFIX.ai, suffix);
}

export function notificationsPath(suffix = ""): string {
  return withSuffix(API_PREFIX.notifications, suffix);
}

export function adminPricingPath(suffix = ""): string {
  return withSuffix(API_PREFIX.adminPricing, suffix);
}

export function adminUsersPath(suffix = ""): string {
  return withSuffix(API_PREFIX.adminUsers, suffix);
}

export function adminSubscriptionsPath(suffix = ""): string {
  return withSuffix(API_PREFIX.adminSubscriptions, suffix);
}

export function adminPaymentsPath(suffix = ""): string {
  return withSuffix(API_PREFIX.adminPayments, suffix);
}

export function adminRevenuePath(suffix = ""): string {
  return withSuffix(API_PREFIX.adminRevenue, suffix);
}

export function adminNotificationsPath(suffix = ""): string {
  return withSuffix(API_PREFIX.adminNotifications, suffix);
}

export function queryString(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    search.set(key, String(value));
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}

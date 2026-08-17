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
 *   /v1/admin/pricing
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
  adminPricing: "/v1/admin/pricing",
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

export function authPath(action: string): string {
  const slug = action.replace(/^\//, "");
  return `${API_PREFIX.auth}/${slug}`;
}

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

export function habitPath(suffix = ""): string {
  const slug = suffix.replace(/^\//, "");
  return slug ? `${API_PREFIX.habits}/${slug}` : API_PREFIX.habits;
}

export function todayPath(suffix = ""): string {
  const slug = suffix.replace(/^\//, "");
  return slug ? `${API_PREFIX.today}/${slug}` : API_PREFIX.today;
}

export function logsPath(suffix = ""): string {
  const slug = suffix.replace(/^\//, "");
  return slug ? `${API_PREFIX.logs}/${slug}` : API_PREFIX.logs;
}

export function statsPath(suffix = ""): string {
  const slug = suffix.replace(/^\//, "");
  return slug ? `${API_PREFIX.stats}/${slug}` : API_PREFIX.stats;
}

export function reminderPath(suffix = ""): string {
  const slug = suffix.replace(/^\//, "");
  return slug ? `${API_PREFIX.reminders}/${slug}` : API_PREFIX.reminders;
}

export function devicePath(suffix = ""): string {
  const slug = suffix.replace(/^\//, "");
  return slug ? `${API_PREFIX.devices}/${slug}` : API_PREFIX.devices;
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

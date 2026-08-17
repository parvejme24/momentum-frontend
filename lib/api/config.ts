/**
 * Server-side API origin. Prefer BACKEND_URL so the BFF can talk to the
 * deployed API without exposing it as a public browser env var.
 */
export function getBackendUrl(): string {
  const base =
    process.env.BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!base) {
    throw new Error("BACKEND_URL or NEXT_PUBLIC_API_URL is not configured");
  }

  return base.replace(/\/$/, "");
}

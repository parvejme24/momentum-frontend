/** App routes that require a session (refresh_token cookie). */
export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/habits",
  "/stats",
  "/settings",
  "/subscription",
  "/checkout",
  "/subscriptions",
  "/users",
  "/admin",
  "/payments",
  "/plans",
  "/ai-prompts",
  "/notifications",
] as const;

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function loginRedirectPath(pathname: string): string {
  const next = encodeURIComponent(pathname);
  return `/login?next=${next}`;
}

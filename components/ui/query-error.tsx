import { ApiError } from "@/lib/api/errors";

export function QueryError({
  error,
  fallback = "Could not load this list",
}: {
  error: unknown;
  fallback?: string;
}) {
  if (!error) return null;
  return (
    <p className="hint hint-err">
      {error instanceof ApiError ? error.message : fallback}
    </p>
  );
}

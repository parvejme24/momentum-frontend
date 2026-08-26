import { ApiError } from "@/lib/api/errors";
import { hint, hintErr } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function QueryError({
  error,
  fallback = "Could not load this list",
}: {
  error: unknown;
  fallback?: string;
}) {
  if (!error) return null;
  return (
    <p className={cn(hint, hintErr)}>
      {error instanceof ApiError ? error.message : fallback}
    </p>
  );
}

"use client";

import { Loader2 } from "lucide-react";

export function PageSpinner({
  label = "Loading",
}: {
  label?: string;
}) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 grid place-items-center text-blue"
      role="status"
      aria-label={label}
    >
      <Loader2 className="animate-spin" size={28} strokeWidth={2.2} aria-hidden />
    </div>
  );
}

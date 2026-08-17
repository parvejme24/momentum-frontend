"use client";

import { Loader2 } from "lucide-react";

export function PageSpinner({
  label = "Loading",
}: {
  label?: string;
}) {
  return (
    <div className="page-spinner" role="status" aria-label={label}>
      <Loader2 className="animate-spin" size={28} strokeWidth={2.2} aria-hidden />
    </div>
  );
}

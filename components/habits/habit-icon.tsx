"use client";

import { Check } from "lucide-react";

import { isHabitEmoji, normalizeHabitIcon } from "@/lib/habits/icon";

type HabitIconProps = {
  icon?: string | null;
  className?: string;
  glyphClassName?: string;
  size?: number;
};

export function HabitIcon({
  icon,
  className = "habit-icon",
  glyphClassName,
  size = 18,
}: HabitIconProps) {
  const normalized = normalizeHabitIcon(icon);

  return (
    <span className={className} aria-hidden>
      {isHabitEmoji(normalized) ? (
        <span className={glyphClassName ?? "habit-icon-emoji"}>{normalized}</span>
      ) : (
        <Check
          className={glyphClassName ?? "habit-icon-fallback"}
          size={size}
          strokeWidth={2.4}
        />
      )}
    </span>
  );
}

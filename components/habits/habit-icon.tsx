"use client";

import { Check } from "lucide-react";

import { isHabitEmoji, normalizeHabitIcon } from "@/lib/habits/icon";
import { cn } from "@/lib/utils";

type HabitIconProps = {
  icon?: string | null;
  className?: string;
  glyphClassName?: string;
  size?: number;
};

export function HabitIcon({
  icon,
  className,
  glyphClassName,
  size = 18,
}: HabitIconProps) {
  const normalized = normalizeHabitIcon(icon);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        className,
      )}
      aria-hidden
    >
      {isHabitEmoji(normalized) ? (
        <span
          className={cn(
            "block text-[1.05rem] leading-none",
            glyphClassName,
          )}
        >
          {normalized}
        </span>
      ) : (
        <Check
          className={cn("shrink-0 text-ink", glyphClassName)}
          size={size}
          strokeWidth={2.4}
        />
      )}
    </span>
  );
}

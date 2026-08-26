"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { hint } from "@/lib/ui";

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export function scorePassword(password: string): PasswordStrength {
  if (!password) return 0;
  if (password.length < 8) return 1;

  let score = 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return 2;
  if (score <= 4) return 3;
  return 4;
}

const HINTS: Record<PasswordStrength, string> = {
  0: "Use at least 8 characters.",
  1: "Too short…",
  2: "Getting there.",
  3: "Good password.",
  4: "Strong password.",
};

const BAR_ON: Record<Exclude<PasswordStrength, 0>, string> = {
  1: "bg-flame border-flame dark:bg-[#d4a574] dark:border-[#d4a574]",
  2: "bg-[#e2a116] border-[#e2a116] dark:bg-[#c9a84a] dark:border-[#c9a84a]",
  3: "bg-blue border-blue",
  4: "bg-[#2f9e64] border-[#2f9e64] dark:bg-[#6db892] dark:border-[#6db892]",
};

const HINT_TINT: Record<Exclude<PasswordStrength, 0>, string> = {
  1: "text-flame dark:text-[#d4a574]",
  2: "text-[#b07a00] dark:text-[#c9a84a]",
  3: "text-blue",
  4: "text-[#2f9e64] dark:text-[#6db892]",
};

export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = useMemo(() => scorePassword(password), [password]);
  const tint = strength === 0 ? undefined : BAR_ON[strength];
  const hintTint = strength === 0 ? undefined : HINT_TINT[strength];

  return (
    <div className="mt-2" aria-live="polite">
      <div className="grid grid-cols-4 gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={cn(
              "h-1.5 rounded-[2px] border-[1.5px] border-ink-30 bg-paper-white transition-[background-color,border-color] duration-[250ms] ease-momentum dark:border-[rgba(221,216,207,0.14)]",
              strength >= bar && tint,
            )}
          />
        ))}
      </div>
      <p className={cn(hint, hintTint)}>
        {HINTS[strength]}
      </p>
    </div>
  );
}

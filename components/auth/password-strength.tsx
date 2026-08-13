"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";

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

export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = useMemo(() => scorePassword(password), [password]);

  return (
    <div className="pw-meter" aria-live="polite">
      <div className="pw-bars" aria-hidden>
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={cn(
              "pw-bar",
              strength >= bar && `pw-bar-on pw-bar-${strength}`,
            )}
          />
        ))}
      </div>
      <p className={cn("hint", strength > 0 && `pw-hint-${strength}`)}>
        {HINTS[strength]}
      </p>
    </div>
  );
}

"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, ready } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={["btn-icon", className].filter(Boolean).join(" ")}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      disabled={!ready}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Flame } from "lucide-react";

import type { DueHabit, RestHabit } from "@/components/today/sample-data";

function formatStreak(habit: DueHabit) {
  if (habit.streakLabel) return habit.streakLabel;
  if (habit.streakDays === 1) return "1 day";
  return `${habit.streakDays} days`;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function HabitRow({
  habit,
  onToggle,
}: {
  habit: DueHabit;
  onToggle: (id: string) => void;
}) {
  const [stamping, setStamping] = useState(false);
  const timer = useRef<number | null>(null);
  const cold = habit.streakDays === 0;

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function handleMark() {
    setStamping(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStamping(false), 340);
    onToggle(habit.id);
  }

  return (
    <article className={habit.done ? "habit done" : "habit"}>
      <div
        className="habit-glyph"
        style={{ background: habit.tint }}
        aria-hidden
      >
        {habit.emoji}
      </div>

      <div className="habit-body">
        <div className="habit-title">{habit.title}</div>
        <div className="habit-meta">
          <span className={cold ? "streak cold" : "streak"}>
            <Flame size={13} aria-hidden />
            <span className="mono">{formatStreak(habit)}</span>
          </span>
          <span>{habit.schedule.label}</span>
          {habit.quantity ? (
            <span className="mono">
              {habit.quantity.current} / {habit.quantity.target}{" "}
              {habit.quantity.unit}
            </span>
          ) : null}
          {habit.weekProgress ? (
            <span className="mono">{habit.weekProgress}</span>
          ) : null}
          {habit.reminder ? (
            <span className="chip chip-quiet">{habit.reminder}</span>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        className={stamping ? "mark stamp" : "mark"}
        aria-pressed={habit.done}
        aria-label={
          habit.done
            ? `Clear ${habit.title} for today`
            : `Mark ${habit.title} for today`
        }
        onClick={handleMark}
      >
        <CheckIcon />
      </button>
    </article>
  );
}

export function RestHabitRow({ habit }: { habit: RestHabit }) {
  return (
    <article className="habit rest">
      <div
        className="habit-glyph"
        style={{ background: habit.tint }}
        aria-hidden
      >
        {habit.emoji}
      </div>
      <div className="habit-body">
        <div className="habit-title">{habit.title}</div>
        <div className="habit-meta">
          <span>{habit.scheduleLabel}</span>
          <span>{habit.nextLabel}</span>
          <span className="chip chip-quiet">Rest</span>
        </div>
      </div>
    </article>
  );
}

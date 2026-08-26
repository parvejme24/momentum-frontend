"use client";

import { useEffect, useRef, useState } from "react";
import { Flame } from "lucide-react";

import type { DueHabit, RestHabit } from "@/components/today/sample-data";
import { chip, chipQuiet, mono } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const HABIT_ROW =
  "group flex items-center gap-4 rounded-lg border border-ink/9 bg-linear-to-br from-[color-mix(in_srgb,var(--paper-white)_92%,var(--blue-soft))] to-paper-raised px-[18px] py-4 shadow-paper-sm transition-[transform,box-shadow,background,opacity] duration-normal ease-smooth hover:-translate-y-0.5 hover:from-[color-mix(in_srgb,var(--paper-white)_80%,var(--blue-soft))] hover:to-[color-mix(in_srgb,var(--paper-raised)_90%,var(--flame-soft))] hover:shadow-hover dark:from-[color-mix(in_srgb,var(--paper-white)_85%,var(--blue-soft))] dark:to-paper-raised dark:hover:-translate-y-[3px] dark:hover:border-[#8ba4c9]/22 dark:hover:shadow-[var(--shadow),var(--shadow-glow)]";

export const HABIT_DONE =
  "from-[color-mix(in_srgb,var(--blue-soft)_45%,var(--paper-raised))] to-paper-raised hover:from-[color-mix(in_srgb,var(--blue-soft)_45%,var(--paper-raised))] hover:to-paper-raised dark:from-[color-mix(in_srgb,var(--blue-soft)_55%,var(--paper-raised))] dark:to-paper-raised";

export const HABIT_REST =
  "bg-[color-mix(in_srgb,var(--paper-raised)_80%,var(--rule))] opacity-[0.72] shadow-none hover:translate-y-0 hover:bg-[color-mix(in_srgb,var(--paper-raised)_80%,var(--rule))] hover:shadow-none";

export const HABIT_GLYPH =
  "grid size-11 shrink-0 place-items-center overflow-hidden rounded-md border border-ink/9 text-[1.15rem] transition-[transform,opacity] duration-normal ease-smooth group-hover:scale-105 group-hover:-rotate-[1.5deg]";

export const HABIT_BODY = "min-w-0 flex-1";

export const HABIT_TITLE =
  "text-[1.02rem] font-bold tracking-[-0.01em] transition-colors duration-normal ease-smooth";

export const HABIT_META =
  "mt-1 flex flex-wrap items-center gap-2.5 text-[0.8rem] text-ink-50";

export const MARK =
  "relative grid size-[46px] shrink-0 cursor-pointer place-items-center rounded-md border border-ink/9 bg-paper-white transition-[transform,box-shadow,background,border-color] duration-normal ease-smooth after:pointer-events-none after:absolute after:inset-[-4px] after:scale-60 after:rounded-[inherit] after:bg-[radial-gradient(circle,color-mix(in_srgb,var(--blue)_28%,transparent),transparent_70%)] after:opacity-0 after:transition-[opacity,transform] after:duration-fast after:ease-smooth hover:scale-105 dark:hover:border-[#8ba4c9]/35";

export const MARK_DONE =
  "bg-linear-to-br from-blue to-blue-deep shadow-[0_0_0_2px_color-mix(in_srgb,var(--blue-soft)_80%,transparent)] after:scale-100 after:opacity-100 dark:from-[#6d8cb0] dark:to-[#8ba4c9] dark:shadow-[0_0_0_3px_rgba(139,164,201,0.2)]";

export const MARK_IDLE =
  "hover:bg-blue-soft dark:hover:bg-[color-mix(in_srgb,var(--blue-soft)_80%,var(--paper-white))]";

export const MARK_SVG =
  "size-6 fill-none stroke-solid-white [stroke-dasharray:32] [stroke-dashoffset:32] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:3.2] transition-[stroke-dashoffset] duration-fast ease-smooth";

export const STREAK =
  "inline-flex items-center gap-[5px] font-mono text-[0.78rem] font-bold text-flame";

function formatStreak(habit: DueHabit) {
  if (habit.streakLabel) return habit.streakLabel;
  if (habit.streakDays === 1) return "1 day";
  return `${habit.streakDays} days`;
}

function CheckIcon({ done }: { done?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn(MARK_SVG, done && "[stroke-dashoffset:0]")}
    >
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
  const [done, setDone] = useState(habit.done);
  const [stamping, setStamping] = useState(false);
  const timer = useRef<number | null>(null);
  const cold = habit.streakDays === 0;

  useEffect(() => {
    setDone(habit.done);
  }, [habit.done]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function handleMark() {
    const nextDone = !done;
    setDone(nextDone);
    setStamping(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStamping(false), 280);
    onToggle(habit.id);
  }

  return (
    <article className={cn(HABIT_ROW, done && HABIT_DONE)}>
      <div
        className={cn(HABIT_GLYPH, done && "opacity-55")}
        style={{ background: habit.tint }}
        aria-hidden
      >
        {habit.emoji}
      </div>

      <div className={HABIT_BODY}>
        <div className={cn(HABIT_TITLE, done && "text-ink-50")}>{habit.title}</div>
        <div className={HABIT_META}>
          <span className={cn(STREAK, cold && "text-ink-30")}>
            <Flame size={13} aria-hidden />
            <span className={mono}>{formatStreak(habit)}</span>
          </span>
          <span>{habit.schedule.label}</span>
          {habit.quantity ? (
            <span className={mono}>
              {habit.quantity.current} / {habit.quantity.target}{" "}
              {habit.quantity.unit}
            </span>
          ) : null}
          {habit.weekProgress ? (
            <span className={mono}>{habit.weekProgress}</span>
          ) : null}
          {habit.reminder ? (
            <span className={cn(chip, chipQuiet)}>{habit.reminder}</span>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        className={cn(
          MARK,
          done ? MARK_DONE : MARK_IDLE,
          stamping && "animate-stamp motion-reduce:animate-none",
        )}
        aria-pressed={done}
        aria-label={
          done
            ? `Clear ${habit.title} for today`
            : `Mark ${habit.title} for today`
        }
        onClick={handleMark}
      >
        <CheckIcon done={done} />
      </button>
    </article>
  );
}

export function RestHabitRow({ habit }: { habit: RestHabit }) {
  return (
    <article className={cn(HABIT_ROW, HABIT_REST)}>
      <div
        className={HABIT_GLYPH}
        style={{ background: habit.tint }}
        aria-hidden
      >
        {habit.emoji}
      </div>
      <div className={HABIT_BODY}>
        <div className={HABIT_TITLE}>{habit.title}</div>
        <div className={HABIT_META}>
          <span>{habit.scheduleLabel}</span>
          <span>{habit.nextLabel}</span>
          <span className={cn(chip, chipQuiet)}>Rest day</span>
        </div>
      </div>
    </article>
  );
}

"use client";

import Link from "next/link";
import { RotateCcw, Trash2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { HabitMiniHeatmap } from "@/components/habits/habit-mini-heatmap";
import type { ArchivedHabit } from "@/components/habits/sample-data";
import { fadeUpSoft } from "@/components/home/motion";
import {
  btn,
  btnDanger,
  btnGhost,
  btnPrimary,
  btnSm,
  card,
  mono,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

const HABIT_GLYPH =
  "grid size-11 shrink-0 place-items-center overflow-hidden rounded-md border border-ink/9 text-[1.15rem]";

export function ArchivedCard({
  habit,
  onRestore,
  onDelete,
}: {
  habit: ArchivedHabit;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      className={cn(
        card,
        "flex h-full min-h-[17.5rem] flex-col gap-4 p-[18px] opacity-[0.88] shadow-paper-sm hover:opacity-100",
      )}
      variants={reduce ? undefined : fadeUpSoft}
    >
      <div className="flex min-h-[5.5rem] items-start gap-3">
        <div
          className={HABIT_GLYPH}
          style={{ background: habit.tint }}
          aria-hidden
        >
          {habit.emoji}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Link
            href={`/habits/${habit.id}`}
            className="m-0 line-clamp-2 cursor-pointer overflow-hidden text-[1.05rem] leading-[1.25] font-bold tracking-[-0.015em] hover:text-blue"
          >
            {habit.title}
          </Link>
          <p className="m-0 line-clamp-2 overflow-hidden text-[0.82rem] leading-[1.35] text-ink-50">
            {habit.schedule}
          </p>
          <p className={cn(mono, "m-0 text-[0.72rem] text-ink-50")}>
            Archived {habit.archivedAt}
          </p>
        </div>
        <span className={cn(mono, "shrink-0 text-[0.92rem] font-bold text-ink-70")}>
          {habit.rate}%
        </span>
      </div>

      <HabitMiniHeatmap
        habitId={habit.id}
        seed={habit.heatSeed}
        fillRate={habit.fillRate}
        label={habit.title}
        weeks={13}
      />

      <div className="mt-auto flex min-h-[2.75rem] flex-wrap items-center justify-between gap-3 border-t border-ink/8 pt-3.5">
        <span className={cn(mono, "text-[0.78rem] font-semibold text-ink-70")}>
          {habit.bestLabel}
        </span>
        <div className="flex flex-wrap gap-2">
          <Link href={`/habits/${habit.id}`} className={cn(btn, btnGhost, btnSm)}>
            History
          </Link>
          <button
            type="button"
            className={cn(btn, btnPrimary, btnSm)}
            onClick={() => onRestore(habit.id)}
          >
            <RotateCcw size={14} strokeWidth={2.4} aria-hidden />
            Restore
          </button>
          <button
            type="button"
            className={cn(btn, btnDanger, btnSm)}
            aria-label={`Delete ${habit.title}`}
            title="Delete forever"
            onClick={() => onDelete(habit.id)}
          >
            <Trash2 size={14} strokeWidth={2.4} aria-hidden />
            Delete
          </button>
        </div>
      </div>
    </motion.article>
  );
}

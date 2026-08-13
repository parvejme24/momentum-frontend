"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { MiniHeatmap } from "@/components/habits/mini-heatmap";
import type {
  ArchivedHabit,
  LibraryHabit,
} from "@/components/habits/sample-data";
import { easeOut, fadeUpSoft } from "@/components/home/motion";

function streakText(habit: LibraryHabit) {
  if (habit.streakLabel) return habit.streakLabel;
  return String(habit.streakDays);
}

export function HabitCard({ habit }: { habit: LibraryHabit }) {
  const reduce = useReducedMotion();
  const cold = habit.streakDays === 0;
  const subtitle = habit.detail
    ? `${habit.schedule} · ${habit.detail}`
    : habit.schedule;

  return (
    <motion.article
      className="card card-hover habit-lib-card"
      layout
      variants={reduce ? undefined : fadeUpSoft}
      initial={reduce ? false : "hidden"}
      animate="show"
      exit={
        reduce
          ? undefined
          : { opacity: 0, y: 8, transition: { duration: 0.18, ease: easeOut } }
      }
    >
      <div className="habit-lib-top">
        <div
          className="habit-glyph"
          style={{ background: habit.tint }}
          aria-hidden
        >
          {habit.emoji}
        </div>
        <div className="habit-lib-copy">
          <Link href={`/habits/${habit.id}`} className="habit-lib-title">
            {habit.title}
          </Link>
          <p className="habit-lib-sub">{subtitle}</p>
        </div>
        <span className={cold ? "streak cold" : "streak"}>
          <Flame size={14} aria-hidden />
          <span className="mono">{streakText(habit)}</span>
        </span>
      </div>

      <MiniHeatmap
        seed={habit.heatSeed}
        fillRate={habit.fillRate}
        activeWeekdays={habit.activeWeekdays}
        label={habit.title}
      />

      <div className="habit-lib-foot">
        {habit.brokenLabel ? (
          <span className="chip chip-flame">{habit.brokenLabel}</span>
        ) : (
          <span className="mono habit-lib-stats">
            {habit.rate}% · {habit.bestLabel}
          </span>
        )}
        <Link href={`/habits/${habit.id}`} className="btn btn-ghost btn-sm">
          Open
        </Link>
      </div>
    </motion.article>
  );
}

export function ArchivedRow({
  habit,
  onRestore,
}: {
  habit: ArchivedHabit;
  onRestore: (id: string) => void;
}) {
  return (
    <div className="habit archived-row">
      <div
        className="habit-glyph"
        style={{ background: habit.tint }}
        aria-hidden
      >
        {habit.emoji}
      </div>
      <div className="habit-body">
        <div className="habit-title">{habit.title}</div>
        <div className="habit-meta mono">
          <span>{habit.schedule}</span>
          <span>
            {habit.rate}% · {habit.bestLabel}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => onRestore(habit.id)}
      >
        Restore
      </button>
    </div>
  );
}

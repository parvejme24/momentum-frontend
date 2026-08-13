"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { MiniHeatmap } from "@/components/habits/mini-heatmap";
import type { ArchivedHabit } from "@/components/habits/sample-data";
import { easeOut, fadeUpSoft } from "@/components/home/motion";

export function ArchivedCard({
  habit,
  onRestore,
}: {
  habit: ArchivedHabit;
  onRestore: (id: string) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      className="card archived-card"
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
      <div className="archived-card-top">
        <div
          className="habit-glyph"
          style={{ background: habit.tint }}
          aria-hidden
        >
          {habit.emoji}
        </div>
        <div className="archived-card-copy">
          <Link href={`/habits/${habit.id}`} className="habit-lib-title">
            {habit.title}
          </Link>
          <p className="habit-lib-sub">{habit.schedule}</p>
          <p className="archived-card-when mono">
            Archived {habit.archivedAt}
          </p>
        </div>
        <span className="mono archived-card-rate">{habit.rate}%</span>
      </div>

      <MiniHeatmap
        seed={habit.heatSeed}
        fillRate={habit.fillRate}
        label={habit.title}
        weeks={13}
      />

      <div className="archived-card-foot">
        <span className="mono habit-lib-stats">{habit.bestLabel}</span>
        <div className="archived-card-actions">
          <Link href={`/habits/${habit.id}`} className="btn btn-ghost btn-sm">
            History
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onRestore(habit.id)}
          >
            <RotateCcw size={14} strokeWidth={2.4} aria-hidden />
            Restore
          </button>
        </div>
      </div>
    </motion.article>
  );
}

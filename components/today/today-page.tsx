"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flame, Plus } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { HabitRow, RestHabitRow } from "@/components/today/habit-row";
import { ProgressRing } from "@/components/today/progress-ring";
import {
  INITIAL_DUE,
  REST_HABITS,
  type DueHabit,
} from "@/components/today/sample-data";
import { WeekBars } from "@/components/today/week-bars";

function formatPrettyDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function coachingLine(habits: DueHabit[], remaining: number) {
  if (remaining === 0) {
    return "Every due square is marked. The chain holds.";
  }

  const strength = habits.find((h) => h.id === "strength" && !h.done);
  if (strength) {
    return `Protect the ${strength.streakDays}-day strength chain — one set still open.`;
  }

  const open = habits.find((h) => !h.done);
  if (open?.streakDays) {
    return `${remaining} left. Keep ${open.title.toLowerCase()} alive.`;
  }

  return remaining === 1
    ? "One square left for today."
    : `${remaining} squares still open today.`;
}

function bestActiveStreak(habits: DueHabit[]) {
  return habits.reduce((max, h) => Math.max(max, h.streakDays), 0);
}

export function TodayPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const [habits, setHabits] = useState(INITIAL_DUE);
  const todayLabel = useMemo(() => formatPrettyDate(new Date()), []);

  const marked = habits.filter((h) => h.done).length;
  const total = habits.length;
  const percent = total === 0 ? 0 : (marked / total) * 100;
  const remaining = total - marked;
  const best = bestActiveStreak(habits);

  function toggleHabit(id: string) {
    const current = habits.find((h) => h.id === id);
    if (!current) return;

    const nextDone = !current.done;
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;
        return {
          ...habit,
          done: nextDone,
          streakDays: nextDone
            ? habit.streakDays + 1
            : Math.max(0, habit.streakDays - 1),
          streakLabel: undefined,
        };
      }),
    );
    pushToast(
      nextDone
        ? `Marked ${current.title} for today`
        : `Cleared ${current.title}`,
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <motion.header
          className="page-head row-between"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div>
            <p className="eyebrow">{todayLabel}</p>
            <h1>Today</h1>
          </div>
          <Link
            href="/habits/new"
            className="btn btn-sm today-new-desktop"
          >
            <Plus size={15} strokeWidth={2.4} aria-hidden />
            New habit
          </Link>
        </motion.header>

        <motion.section
          className="card summary"
          aria-label="Today summary"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <ProgressRing percent={percent} />
          <div className="summary-copy">
            <p className="summary-count mono">
              {marked} of {total} marked
            </p>
            <p className="summary-coach">{coachingLine(habits, remaining)}</p>
            <div className="summary-chips">
              <span className="chip chip-flame">
                <Flame size={12} aria-hidden />
                Best {best} days
              </span>
              <span className="chip chip-quiet">86% this month</span>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="today-section"
          aria-labelledby="due-today-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className="panel-head">
            <div>
              <h2 id="due-today-heading" className="section-title">
                Due today
              </h2>
              <p className="hint mono" style={{ marginTop: 4 }}>
                Tap the square to mark it
              </p>
            </div>
          </div>

          <div className="habit-list">
            {habits.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onToggle={toggleHabit}
              />
            ))}
          </div>
        </motion.section>

        <motion.section
          className="card today-section"
          aria-labelledby="weeks-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className="panel-head">
            <h2 id="weeks-heading" className="section-title">
              Every habit, last 12 weeks
            </h2>
            <Link href="/stats" className="auth-inline-link mono">
              Full stats →
            </Link>
          </div>
          <WeekBars />
        </motion.section>

        <motion.section
          className="today-section"
          aria-labelledby="rest-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className="panel-head">
            <div>
              <h2 id="rest-heading" className="section-title">
                Not scheduled today
              </h2>
              <p className="hint" style={{ marginTop: 4 }}>
                Won’t affect your streaks
              </p>
            </div>
          </div>
          <div className="habit-list">
            {REST_HABITS.map((habit) => (
              <RestHabitRow key={habit.id} habit={habit} />
            ))}
          </div>
        </motion.section>
      </motion.div>
    </MotionConfig>
  );
}

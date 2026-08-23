"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flame, Plus } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { HabitRow, RestHabitRow } from "@/components/today/habit-row";
import { ProgressRing } from "@/components/today/progress-ring";
import { WeekBars } from "@/components/today/week-bars";
import { AiSuggestionsPanel } from "@/components/ai/ai-suggestions-panel";
import { TodayPageSkeleton } from "@/components/ui/page-skeletons";
import { ApiError } from "@/lib/api/errors";
import { asPercent, formatPrettyIso } from "@/lib/dates";
import { useGroupedReminders } from "@/lib/reminders/hooks";
import { useOverviewStats } from "@/lib/stats/hooks";
import { lastWeekRates } from "@/lib/stats/map";
import { useToday, useToggleTodayLog } from "@/lib/today/hooks";
import {
  coachingLine,
  reminderTimeForHabit,
  toDueHabit,
  toRestHabit,
} from "@/lib/today/map";

function formatPrettyDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function TodayPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const todayQuery = useToday();
  const remindersQuery = useGroupedReminders();
  const overviewQuery = useOverviewStats("90d");
  const toggle = useToggleTodayLog();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const data = todayQuery.data;
  const todayLabel = data
    ? formatPrettyIso(data.date, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : formatPrettyDate(new Date());

  const due = useMemo(
    () =>
      (data?.habits ?? []).map((habit) =>
        toDueHabit(
          habit,
          reminderTimeForHabit(remindersQuery.data?.habits, habit.id),
        ),
      ),
    [data?.habits, remindersQuery.data?.habits],
  );
  const rest = useMemo(
    () =>
      (data?.notDueToday ?? []).map((habit) =>
        toRestHabit(habit, data?.date ?? ""),
      ),
    [data?.notDueToday, data?.date],
  );

  const marked = data?.summary.completed ?? 0;
  const total = data?.summary.total ?? 0;
  const percent = asPercent(data?.summary.rate ?? 0);
  const remaining = Math.max(0, total - marked);
  const best = due.reduce((max, habit) => Math.max(max, habit.streakDays), 0);
  const open = data?.habits.find(
    (habit) => habit.log?.status !== "DONE" && habit.log?.status !== "PARTIAL",
  );
  const weekRates = lastWeekRates(overviewQuery.data?.byWeek ?? []);
  const monthRate = asPercent(overviewQuery.data?.completion.rate ?? 0);

  async function onToggle(id: string) {
    const current = data?.habits.find((habit) => habit.id === id);
    if (!current || !data) return;
    const nextDone = !(
      current.log?.status === "DONE" || current.log?.status === "PARTIAL"
    );
    setPendingId(id);
    try {
      await toggle.mutateAsync({ habit: current, date: data.date });
      pushToast(
        nextDone
          ? `Marked ${current.title} for today`
          : `Cleared ${current.title}`,
      );
    } catch (error) {
      pushToast(
        error instanceof ApiError ? error.message : "Could not update log",
      );
    } finally {
      setPendingId(null);
    }
  }

  if (todayQuery.isLoading) {
    return <TodayPageSkeleton />;
  }

  if (todayQuery.error) {
    return (
      <div className="page-head">
        <h1>Today</h1>
        <p className="hint hint-err" style={{ marginTop: 12 }}>
          {todayQuery.error instanceof ApiError
            ? todayQuery.error.message
            : "Could not load today"}
        </p>
      </div>
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
          <Link href="/habits/new" className="btn btn-sm today-new-desktop">
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
            <p className="summary-coach">
              {coachingLine(remaining, open?.title, open?.streak.current)}
            </p>
            <div className="summary-chips">
              <span className="chip chip-flame">
                <Flame size={12} aria-hidden />
                Best {best} days
              </span>
              <span className="chip chip-quiet">{monthRate}% this range</span>
            </div>
          </div>
        </motion.section>

        <motion.div className="today-ai-wrap" variants={reduce ? undefined : fadeUpSoft}>
          <AiSuggestionsPanel />
        </motion.div>

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

          {due.length === 0 ? (
            <p className="hint">Nothing due today.</p>
          ) : (
            <div className="habit-list">
              {due.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  onToggle={pendingId ? () => undefined : onToggle}
                />
              ))}
            </div>
          )}
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
          <WeekBars rates={weekRates} />
        </motion.section>

        {rest.length > 0 ? (
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
              {rest.map((habit) => (
                <RestHabitRow key={habit.id} habit={habit} />
              ))}
            </div>
          </motion.section>
        ) : null}
      </motion.div>
    </MotionConfig>
  );
}

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, Plus } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { HabitRow, RestHabitRow } from "@/components/today/habit-row";
import { ProgressRing } from "@/components/today/progress-ring";
import { WeekBars } from "@/components/today/week-bars";
import { TodayPageSkeleton } from "@/components/ui/page-skeletons";
import { ApiError } from "@/lib/api/errors";
import { navPrefetchHandlers } from "@/lib/app/prefetch";
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
import {
  btn,
  btnSm,
  card,
  chip,
  chipFlame,
  chipQuiet,
  eyebrow,
  hint,
  hintErr,
  mono,
  pageHead,
  panelHead,
  rowBetween,
  sectionTitle,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

function formatPrettyDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function TodayPage() {
  const reduce = useReducedMotion();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const todayQuery = useToday();
  const remindersQuery = useGroupedReminders();
  const overviewQuery = useOverviewStats("90d");
  const toggle = useToggleTodayLog();

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

  function onToggle(id: string) {
    const current = data?.habits.find((habit) => habit.id === id);
    if (!current || !data) return;
    const nextDone = !(
      current.log?.status === "DONE" || current.log?.status === "PARTIAL"
    );

    toggle.mutate(
      { habit: current, date: data.date },
      {
        onSuccess: () => {
          pushToast(
            nextDone
              ? `Nice — ${current.title} is marked for today`
              : `Cleared ${current.title}`,
          );
        },
        onError: (error) => {
          pushToast(
            error instanceof ApiError ? error.message : "Could not update log",
          );
        },
      },
    );
  }

  if (todayQuery.isLoading && !data) {
    return <TodayPageSkeleton />;
  }

  if (todayQuery.error) {
    return (
      <div className={pageHead}>
        <h1>Today</h1>
        <p className={cn(hint, hintErr, "mt-3")}>
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
          className={cn(pageHead, rowBetween)}
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div>
            <p className={cn(eyebrow, "mb-2")}>{todayLabel}</p>
            <h1 className="mt-4">Today</h1>
          </div>
          <Link
            href="/habits/new"
            className={cn(btn, btnSm, "shrink-0 max-nav:hidden")}
          >
            <Plus size={15} strokeWidth={2.4} aria-hidden />
            New habit
          </Link>
        </motion.header>

        <motion.section
          className={cn(
            card,
            "relative flex items-start gap-[clamp(18px,3vw,28px)] overflow-hidden [background-image:linear-gradient(125deg,color-mix(in_srgb,var(--blue-soft)_55%,var(--paper-white))_0%,var(--paper-raised)_48%,color-mix(in_srgb,var(--flame-soft)_50%,var(--paper-white))_100%)] before:pointer-events-none before:absolute before:right-[-20%] before:bottom-[-40%] before:z-0 before:size-[180px] before:rounded-full before:bg-[radial-gradient(circle,color-mix(in_srgb,var(--flame)_18%,transparent),transparent_70%)] max-nav:flex-col max-nav:items-start [&>*]:relative [&>*]:z-[1] dark:[background-image:linear-gradient(130deg,color-mix(in_srgb,var(--blue-soft)_70%,var(--paper-raised))_0%,var(--paper-raised)_45%,color-mix(in_srgb,var(--flame-soft)_65%,var(--paper-raised))_100%)]",
          )}
          aria-label="Today summary"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <ProgressRing percent={percent} />
          <div className="relative z-[1] min-w-0 flex-1 pt-1.5">
            <p className={cn(mono, "m-0 text-[1.05rem] font-bold tracking-[-0.03em]")}>
              {marked} of {total} marked
            </p>
            <p className="mt-2 max-w-[42ch] text-[0.95rem] text-ink-70">
              {coachingLine(remaining, open?.title, open?.streak.current)}
            </p>
            <div className="mt-3.5 flex flex-wrap gap-2">
              <span className={cn(chip, chipFlame)}>
                <Flame size={12} aria-hidden />
                Best {best} days
              </span>
              <span className={cn(chip, chipQuiet)}>{monthRate}% this range</span>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="mt-8"
          aria-labelledby="due-today-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className={cn(panelHead, "mb-3.5 border-b-0 pb-0")}>
            <div>
              <h2 id="due-today-heading" className={sectionTitle}>
                Due today
              </h2>
              <p className={cn(hint, mono, "mt-1")}>
                Tap the check to celebrate showing up
              </p>
            </div>
          </div>

          {due.length === 0 ? (
            <p className={hint}>Nothing due today.</p>
          ) : (
            <div className="grid gap-3">
              {due.map((habit) => (
                <HabitRow key={habit.id} habit={habit} onToggle={onToggle} />
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          className={cn(card, "mt-8")}
          aria-labelledby="weeks-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className={cn(panelHead, "items-start")}>
            <h2 id="weeks-heading" className={sectionTitle}>
              Every habit, last 12 weeks
            </h2>
            <Link
              href="/stats"
              className={cn(
                mono,
                "mt-[3px] shrink-0 cursor-pointer text-[0.68rem] font-semibold tracking-[0.08em] whitespace-nowrap text-blue uppercase hover:text-ink",
              )}
              {...navPrefetchHandlers(queryClient, "/stats")}
            >
              Full stats →
            </Link>
          </div>
          <div className="mt-0.5">
            <WeekBars rates={weekRates} />
          </div>
        </motion.section>

        {rest.length > 0 ? (
          <motion.section
            className="mt-8"
            aria-labelledby="rest-heading"
            variants={reduce ? undefined : fadeUpSoft}
          >
            <div className={cn(panelHead, "mb-3.5 border-b-0 pb-0")}>
              <div>
                <h2 id="rest-heading" className={sectionTitle}>
                  Not scheduled today
                </h2>
                <p className={cn(hint, "mt-1")}>
                  Rest days don’t break your streaks
                </p>
              </div>
            </div>
            <div className="grid gap-3">
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

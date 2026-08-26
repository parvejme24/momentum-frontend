"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";

import { HabitCard } from "@/components/habits/habit-card";
import type { HabitCategory, LibraryHabit } from "@/components/habits/sample-data";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { HabitCardsSkeleton } from "@/components/ui/page-skeletons";
import { ApiError } from "@/lib/api/errors";
import { useHabits } from "@/lib/habits/hooks";
import { toLibraryHabit } from "@/lib/habits/map";
import {
  btn,
  btnPrimary,
  btnSm,
  eyebrow,
  hint,
  hintErr,
  mono,
  pageHead,
  rowBetween,
  sectionTitle,
  tabBar,
  tabs,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

type FilterTab = "all" | HabitCategory;

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "building", label: "Building" },
  { id: "quitting", label: "Quitting" },
  { id: "at-risk", label: "At risk" },
];

function matchesFilter(habit: LibraryHabit, filter: FilterTab) {
  if (filter === "all") return true;
  return habit.categories.includes(filter);
}

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Could not load habits";
}

export function HabitsPage() {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<FilterTab>("all");
  const activeQuery = useHabits(false);

  const active = useMemo(
    () => (activeQuery.data ?? []).map(toLibraryHabit),
    [activeQuery.data],
  );

  const filtered = useMemo(
    () => active.filter((habit) => matchesFilter(habit, filter)),
    [active, filter],
  );

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
            <p className={cn(eyebrow, "mb-2")}>{active.length} active</p>
            <h1 className="mt-4">Habits</h1>
          </div>
          <Link href="/habits/new" className={cn(btn, btnPrimary, btnSm)}>
            <Plus size={15} strokeWidth={2.4} aria-hidden />
            New habit
          </Link>
        </motion.header>

        {activeQuery.error ? (
          <p className={cn(hint, hintErr)}>{errorMessage(activeQuery.error)}</p>
        ) : null}

        <motion.div
          className={cn(rowBetween, "mb-[22px] items-end max-nav:flex-col max-nav:items-start max-nav:gap-3")}
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className={tabBar} role="tablist" aria-label="Habit filters">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={filter === tab.id}
                className={tabs(filter === tab.id)}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className={cn(mono, "text-[0.68rem] tracking-[0.04em] whitespace-nowrap text-ink-50")}>
            Last 90 days shown
          </span>
        </motion.div>

        {activeQuery.isLoading ? (
          <HabitCardsSkeleton count={4} />
        ) : active.length === 0 ? (
          <motion.div
            className="rounded-lg border-2 border-dashed border-ink-30 px-6 py-14 text-center"
            variants={reduce ? undefined : fadeUpSoft}
          >
            <h2 className={sectionTitle}>No habits yet</h2>
            <p className={cn(hint, "mt-2")}>Create one to start a chain.</p>
          </motion.div>
        ) : (
          <>
            <motion.section
              className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 wide:grid-cols-4 [&>*]:m-0 [&>*]:min-w-0"
              aria-label="Active habits"
              initial={reduce ? false : "hidden"}
              animate="show"
              variants={reduce ? undefined : staggerContainer}
            >
              <AnimatePresence initial={false}>
                {filtered.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
              </AnimatePresence>
            </motion.section>

            {filtered.length === 0 ? (
              <p className={cn(hint, "mt-2")}>No habits in this filter.</p>
            ) : null}
          </>
        )}
      </motion.div>
    </MotionConfig>
  );
}

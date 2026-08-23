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
          className="page-head row-between"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div>
            <p className="eyebrow">{active.length} active</p>
            <h1>Habits</h1>
          </div>
          <Link href="/habits/new" className="btn btn-primary btn-sm">
            <Plus size={15} strokeWidth={2.4} aria-hidden />
            New habit
          </Link>
        </motion.header>

        {activeQuery.error ? (
          <p className="hint hint-err">{errorMessage(activeQuery.error)}</p>
        ) : null}

        <motion.div
          className="habits-filter row-between"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className="tab-bar" role="tablist" aria-label="Habit filters">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={filter === tab.id}
                className={filter === tab.id ? "tab active" : "tab"}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="mono habits-filter-hint">Last 90 days shown</span>
        </motion.div>

        {activeQuery.isLoading ? (
          <HabitCardsSkeleton count={4} />
        ) : active.length === 0 ? (
          <motion.div
            className="empty"
            variants={reduce ? undefined : fadeUpSoft}
          >
            <h2 className="section-title">No habits yet</h2>
            <p className="hint" style={{ marginTop: 8 }}>
              Create one to start a chain.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.section
              className="habit-lib-grid"
              aria-label="Active habits"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
              </AnimatePresence>
            </motion.section>

            {filtered.length === 0 ? (
              <p className="hint" style={{ marginTop: 8 }}>
                No habits in this filter.
              </p>
            ) : null}
          </>
        )}
      </motion.div>
    </MotionConfig>
  );
}

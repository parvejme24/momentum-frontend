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

import { useToast } from "@/components/auth/toast";
import { ArchivedRow, HabitCard } from "@/components/habits/habit-card";
import {
  ACTIVE_HABITS,
  INITIAL_ARCHIVED,
  type ArchivedHabit,
  type HabitCategory,
  type LibraryHabit,
} from "@/components/habits/sample-data";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";

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

export function HabitsPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [active, setActive] = useState(ACTIVE_HABITS);
  const [archived, setArchived] = useState(INITIAL_ARCHIVED);

  const filtered = useMemo(
    () => active.filter((habit) => matchesFilter(habit, filter)),
    [active, filter],
  );

  function restoreHabit(id: string) {
    const item = archived.find((h) => h.id === id);
    if (!item) return;

    setArchived((prev) => prev.filter((h) => h.id !== id));
    setActive((prev) => {
      if (prev.some((h) => h.id === id)) return prev;
      const restored: LibraryHabit = {
        id: item.id,
        title: item.title,
        emoji: item.emoji,
        tint: item.tint,
        categories: ["building"],
        schedule: item.schedule,
        streakDays: 0,
        rate: item.rate,
        bestLabel: item.bestLabel,
        heatSeed: item.heatSeed,
        fillRate: item.fillRate,
      };
      return [...prev, restored];
    });
    pushToast(`Restored ${item.title}`);
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
            <p className="eyebrow">
              {active.length} active ·{" "}
              <Link href="/habits/archived" className="archived-count-link">
                {archived.length} archived
              </Link>
            </p>
            <h1>Habits</h1>
          </div>
          <Link href="/habits/new" className="btn btn-primary btn-sm">
            <Plus size={15} strokeWidth={2.4} aria-hidden />
            New habit
          </Link>
        </motion.header>

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

        <motion.section
          className="today-section"
          aria-labelledby="archived-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className="panel-head">
            <div>
              <h2 id="archived-heading" className="section-title">
                Archived
              </h2>
              <p className="hint" style={{ marginTop: 4 }}>
                History is kept. Restore any time.
              </p>
            </div>
            <Link href="/habits/archived" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </div>

          {archived.length === 0 ? (
            <p className="hint">Nothing archived right now.</p>
          ) : (
            <div className="habit-list">
              {archived.slice(0, 2).map((habit: ArchivedHabit) => (
                <ArchivedRow
                  key={habit.id}
                  habit={habit}
                  onRestore={restoreHabit}
                />
              ))}
            </div>
          )}
        </motion.section>
      </motion.div>
    </MotionConfig>
  );
}

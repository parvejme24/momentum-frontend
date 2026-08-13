"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";

import { useToast } from "@/components/auth/toast";
import { ArchivedCard } from "@/components/habits/archived-card";
import {
  ACTIVE_HABITS,
  INITIAL_ARCHIVED,
  type LibraryHabit,
} from "@/components/habits/sample-data";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";

export function ArchivedPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const [archived, setArchived] = useState(INITIAL_ARCHIVED);
  const [active, setActive] = useState(ACTIVE_HABITS);

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
        className="archived-page"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <motion.header
          className="archived-head"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <Link href="/habits" className="back-link mono">
            ← All habits
          </Link>
          <div className="page-head" style={{ marginBottom: 0 }}>
            <p className="eyebrow">
              {archived.length} archived · {active.length} active
            </p>
            <h1>Archived</h1>
            <p className="lede" style={{ marginTop: 10, maxWidth: "48ch" }}>
              Habits leave the daily list when archived. Every mark and chain
              stays on file — restore any time.
            </p>
          </div>
        </motion.header>

        {archived.length === 0 ? (
          <motion.div
            className="empty archived-empty"
            variants={reduce ? undefined : fadeUpSoft}
          >
            <div className="empty-grid" aria-hidden>
              {Array.from({ length: 15 }).map((_, i) => (
                <i key={i} />
              ))}
            </div>
            <h2 className="section-title">Nothing archived</h2>
            <p className="hint" style={{ marginTop: 8 }}>
              When you archive a habit, it lands here with its full history.
            </p>
            <Link href="/habits" className="btn btn-primary" style={{ marginTop: 20 }}>
              Back to habits
            </Link>
          </motion.div>
        ) : (
          <motion.section
            className="archived-grid"
            aria-label="Archived habits"
            variants={reduce ? undefined : fadeUpSoft}
          >
            <AnimatePresence mode="popLayout">
              {archived.map((habit) => (
                <ArchivedCard
                  key={habit.id}
                  habit={habit}
                  onRestore={restoreHabit}
                />
              ))}
            </AnimatePresence>
          </motion.section>
        )}
      </motion.div>
    </MotionConfig>
  );
}

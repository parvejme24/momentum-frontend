"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";

import { useToast } from "@/components/auth/toast";
import { ArchivedCard } from "@/components/habits/archived-card";
import type { ArchivedHabit } from "@/components/habits/sample-data";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { ConfirmSheet } from "@/components/settings/confirm-sheet";
import { HabitCardsSkeleton } from "@/components/ui/page-skeletons";
import { ApiError } from "@/lib/api/errors";
import {
  useDeleteHabit,
  useHabits,
  useRestoreHabit,
} from "@/lib/habits/hooks";
import { toArchivedHabit } from "@/lib/habits/map";

type DeleteTarget =
  | { kind: "one"; habit: ArchivedHabit }
  | { kind: "all" }
  | null;

export function ArchivedPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const archivedQuery = useHabits(true);
  const activeQuery = useHabits(false);
  const restore = useRestoreHabit();
  const remove = useDeleteHabit();
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [deleting, setDeleting] = useState(false);

  const archived = useMemo(
    () => (archivedQuery.data ?? []).map(toArchivedHabit),
    [archivedQuery.data],
  );
  const activeCount = activeQuery.data?.length ?? 0;
  const loading = archivedQuery.isLoading || activeQuery.isLoading;

  async function onRestore(id: string) {
    const item = archived.find((h) => h.id === id);
    try {
      await restore.mutateAsync(id);
      pushToast(item ? `Restored ${item.title}` : "Habit restored");
    } catch (error) {
      pushToast(error instanceof ApiError ? error.message : "Could not restore habit");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      if (deleteTarget.kind === "one") {
        const { habit } = deleteTarget;
        await remove.mutateAsync(habit.id);
        setDeleteTarget(null);
        pushToast(`Deleted ${habit.title}`);
        return;
      }

      const count = archived.length;
      for (const habit of archived) {
        await remove.mutateAsync(habit.id);
      }
      setDeleteTarget(null);
      pushToast(
        count === 1
          ? "Deleted 1 archived habit"
          : `Deleted all ${count} archived habits`,
      );
    } catch (error) {
      pushToast(error instanceof ApiError ? error.message : "Could not delete habit");
    } finally {
      setDeleting(false);
    }
  }

  const sheetOpen = deleteTarget !== null;
  const sheetTitle =
    deleteTarget?.kind === "one"
      ? `Delete ${deleteTarget.habit.title}?`
      : "Delete all archived habits?";

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
          <div className="page-head">
            <p className="eyebrow">
              {archived.length} archived · {activeCount} active
            </p>
            <h1>Archived</h1>
            <p className="lede">
              Habits you archive leave Today, but their marks and chains stay
              here. Restore one when you want it back.
            </p>
          </div>
        </motion.header>

        {archivedQuery.error ? (
          <p className="hint hint-err">
            {archivedQuery.error instanceof ApiError
              ? archivedQuery.error.message
              : "Could not load archived habits"}
          </p>
        ) : null}

        {loading ? (
          <HabitCardsSkeleton count={4} />
        ) : archived.length === 0 ? (
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
            <Link
              href="/habits"
              className="btn btn-primary"
              style={{ marginTop: 20 }}
            >
              Back to habits
            </Link>
          </motion.div>
        ) : (
          <>
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
                    onRestore={onRestore}
                    onDelete={(id) => {
                      const item = archived.find((h) => h.id === id);
                      if (!item) return;
                      setDeleteTarget({ kind: "one", habit: item });
                    }}
                  />
                ))}
              </AnimatePresence>
            </motion.section>

            <motion.aside
              className="archived-clear"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="archived-clear-copy">
                <p className="eyebrow">Clear archive</p>
                <p className="archived-clear-lede">
                  Done with this list? Delete all removes {archived.length}{" "}
                  {archived.length === 1 ? "habit" : "habits"} and their
                  history. Active habits are not touched.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm archived-delete-all"
                onClick={() => setDeleteTarget({ kind: "all" })}
              >
                <Trash2 size={15} strokeWidth={2.4} aria-hidden />
                Delete all archived
              </button>
            </motion.aside>
          </>
        )}

        <ConfirmSheet
          open={sheetOpen}
          onClose={() => {
            if (deleting) return;
            setDeleteTarget(null);
          }}
          title={sheetTitle}
        >
          <p className="hint" style={{ marginTop: 10, lineHeight: 1.55 }}>
            {deleteTarget?.kind === "one" ? (
              <>
                This removes the habit and its history for good. You can’t undo
                this from the archive.
              </>
            ) : (
              <>
                Every archived habit and its history will be removed forever.
                Active habits are not touched.
              </>
            )}
          </p>
          <div className="settings-actions" style={{ marginTop: 22 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {deleteTarget?.kind === "all" ? "Keep archive" : "Keep it"}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => void confirmDelete()}
              disabled={deleting}
            >
              {deleting
                ? "Deleting…"
                : deleteTarget?.kind === "all"
                  ? "Delete all"
                  : "Delete forever"}
            </button>
          </div>
        </ConfirmSheet>
      </motion.div>
    </MotionConfig>
  );
}

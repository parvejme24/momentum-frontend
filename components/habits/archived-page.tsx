"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import {
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
import {
  backLink,
  btn,
  btnDanger,
  btnGhost,
  btnPrimary,
  btnSm,
  eyebrow,
  hint,
  hintErr,
  lede,
  mono,
  pageHead,
  sectionTitle,
  settingsActions,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

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
        className="min-w-0"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <motion.header
          className="mb-8"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <Link href="/habits" className={cn(backLink, mono, "mb-4")}>
            ← All habits
          </Link>
          <div className={cn(pageHead, "mb-0 w-full min-w-0")}>
            <p className={cn(eyebrow, "mb-2")}>
              {archived.length} archived · {activeCount} active
            </p>
            <h1 className="mt-4 wrap-anywhere text-[clamp(1.7rem,6vw,2.4rem)]">
              Archived
            </h1>
            <p className={cn(lede, "mt-4 max-w-[48ch] wrap-break-word text-[clamp(0.92rem,2.6vw,1.08rem)]")}>
              Habits you archive leave Today, but their marks and chains stay
              here. Restore one when you want it back.
            </p>
          </div>
        </motion.header>

        {archivedQuery.error ? (
          <p className={cn(hint, hintErr)}>
            {archivedQuery.error instanceof ApiError
              ? archivedQuery.error.message
              : "Could not load archived habits"}
          </p>
        ) : null}

        {loading ? (
          <HabitCardsSkeleton count={4} />
        ) : archived.length === 0 ? (
          <motion.div
            className="mt-2 rounded-lg border-2 border-dashed border-ink-30 px-6 py-14 text-center"
            variants={reduce ? undefined : fadeUpSoft}
          >
            <div
              className="mb-5 grid grid-cols-[repeat(5,14px)] justify-center gap-1"
              aria-hidden
            >
              {Array.from({ length: 15 }).map((_, i) => (
                <i
                  key={i}
                  className="block aspect-square rounded-[2px] border-2 border-dashed border-ink-30"
                />
              ))}
            </div>
            <h2 className={sectionTitle}>Nothing archived</h2>
            <p className={cn(hint, "mt-2")}>
              When you archive a habit, it lands here with its full history.
            </p>
            <Link href="/habits" className={cn(btn, btnPrimary, "mt-5")}>
              Back to habits
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.section
              className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 wide:grid-cols-4 [&>*]:m-0 [&>*]:min-w-0"
              aria-label="Archived habits"
              initial={reduce ? false : "hidden"}
              animate="show"
              variants={reduce ? undefined : staggerContainer}
            >
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
            </motion.section>

            <motion.aside
              className="mt-10 flex items-end justify-between gap-6 border-t border-ink/8 pt-8 max-nav:flex-col max-nav:items-stretch"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="min-w-0 flex-1">
                <p className={eyebrow}>Clear archive</p>
                <p className="mt-4 max-w-[46ch] text-[0.92rem] leading-[1.5] text-ink-70">
                  Done with this list? Delete all removes {archived.length}{" "}
                  {archived.length === 1 ? "habit" : "habits"} and their
                  history. Active habits are not touched.
                </p>
              </div>
              <button
                type="button"
                className={cn(
                  btn,
                  btnGhost,
                  btnSm,
                  "shrink-0 border-flame text-flame hover:border-flame hover:text-flame hover:shadow-hover max-nav:w-fit",
                )}
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
          <p className={cn(hint, "mt-2.5 leading-[1.55]")}>
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
          <div className={cn(settingsActions, "mt-[22px]")}>
            <button
              type="button"
              className={cn(btn, btnGhost)}
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {deleteTarget?.kind === "all" ? "Keep archive" : "Keep it"}
            </button>
            <button
              type="button"
              className={cn(btn, btnDanger)}
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

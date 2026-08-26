"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, Flame, Pencil } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { useToast } from "@/components/auth/toast";
import { HabitMiniHeatmap } from "@/components/habits/habit-mini-heatmap";
import type {
  ArchivedHabit,
  LibraryHabit,
} from "@/components/habits/sample-data";
import { easeOut, fadeUpSoft } from "@/components/home/motion";
import { ConfirmSheet } from "@/components/settings/confirm-sheet";
import { ApiError } from "@/lib/api/errors";
import { useArchiveHabit } from "@/lib/habits/hooks";
import {
  btn,
  btnDanger,
  btnGhost,
  btnSm,
  card,
  cardHover,
  chip,
  chipFlame,
  hint,
  mono,
  settingsActions,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

const HABIT_GLYPH =
  "grid size-11 shrink-0 place-items-center overflow-hidden rounded-md border border-ink/9 text-[1.15rem] transition-[transform,opacity] duration-normal ease-smooth";

const HABIT_ROW =
  "group flex items-center gap-4 rounded-lg border border-ink/9 bg-linear-to-br from-[color-mix(in_srgb,var(--paper-white)_92%,var(--blue-soft))] to-paper-raised px-[18px] py-4 shadow-paper-sm transition-[transform,box-shadow,background,opacity] duration-normal ease-smooth";

function streakText(habit: LibraryHabit) {
  if (habit.streakLabel) return habit.streakLabel;
  return String(habit.streakDays);
}

export function HabitCard({ habit }: { habit: LibraryHabit }) {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const archive = useArchiveHabit();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const cold = habit.streakDays === 0;
  const subtitle = habit.detail
    ? `${habit.schedule} · ${habit.detail}`
    : habit.schedule;

  async function confirmArchive() {
    try {
      await archive.mutateAsync(habit.id);
      setArchiveOpen(false);
      pushToast(`Archived ${habit.title}`);
    } catch (error) {
      pushToast(
        error instanceof ApiError ? error.message : "Could not archive habit",
      );
    }
  }

  return (
    <motion.article
      className={cn(
        card,
        cardHover,
        "box-border grid h-[20.25rem] max-h-[20.25rem] min-h-[20.25rem] grid-rows-[5rem_7.25rem_3.75rem] gap-4 overflow-hidden p-[18px]",
      )}
      variants={reduce ? undefined : fadeUpSoft}
      exit={
        reduce
          ? undefined
          : { opacity: 0, scale: 0.98, transition: { duration: 0.22, ease: easeOut } }
      }
      layout={false}
    >
      <div className="flex min-h-0 items-start gap-3 overflow-hidden">
        <div
          className={HABIT_GLYPH}
          style={{ background: habit.tint }}
          aria-hidden
        >
          {habit.emoji}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Link
            href={`/habits/${habit.id}`}
            className="m-0 line-clamp-2 cursor-pointer overflow-hidden text-[1.05rem] leading-[1.25] font-bold tracking-[-0.015em] hover:text-blue"
          >
            {habit.title}
          </Link>
          <p className="m-0 line-clamp-2 overflow-hidden text-[0.82rem] leading-[1.35] text-ink-50">
            {subtitle}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex w-14 shrink-0 items-center justify-end gap-[5px] whitespace-nowrap font-mono text-[0.78rem] font-bold text-flame",
            cold && "text-ink-30",
          )}
        >
          <Flame size={14} aria-hidden />
          <span className={mono}>{streakText(habit)}</span>
        </span>
      </div>

      <HabitMiniHeatmap
        habitId={habit.id}
        seed={habit.heatSeed}
        fillRate={habit.fillRate}
        activeWeekdays={habit.activeWeekdays}
        label={habit.title}
      />

      <div className="flex min-h-0 items-center justify-between gap-3 border-t border-ink/8 pt-3.5">
        <div className="flex min-h-[1.875rem] min-w-0 flex-1 items-center">
          {habit.brokenLabel ? (
            <span className={cn(chip, chipFlame)}>{habit.brokenLabel}</span>
          ) : (
            <span className={cn(mono, "text-[0.78rem] font-semibold text-ink-70")}>
              {habit.rate}% · {habit.bestLabel}
            </span>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <Link
            href={`/habits/${habit.id}/edit`}
            className={cn(btn, btnGhost, btnSm, "shrink-0")}
          >
            <Pencil size={14} strokeWidth={2.2} aria-hidden />
            Edit
          </Link>
          <button
            type="button"
            className={cn(
              btn,
              btnGhost,
              btnSm,
              "text-ink-70 hover:border-[color-mix(in_srgb,var(--flame)_45%,transparent)] hover:bg-flame-soft hover:text-danger-ink",
            )}
            onClick={() => setArchiveOpen(true)}
            disabled={archive.isPending}
          >
            <Archive size={14} strokeWidth={2.2} aria-hidden />
            Archive
          </button>
        </div>
      </div>

      <ConfirmSheet
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        title="Archive this habit?"
      >
        <p className={cn(hint, "mt-2.5 leading-[1.55]")}>
          It leaves the daily list right away. History stays on file — restore
          from Archive anytime.
        </p>
        <div className={cn(settingsActions, "mt-[22px]")}>
          <button
            type="button"
            className={cn(btn, btnGhost)}
            onClick={() => setArchiveOpen(false)}
            disabled={archive.isPending}
          >
            Keep it active
          </button>
          <button
            type="button"
            className={cn(btn, btnDanger)}
            onClick={() => void confirmArchive()}
            disabled={archive.isPending}
          >
            {archive.isPending ? "Archiving…" : "Archive habit"}
          </button>
        </div>
      </ConfirmSheet>
    </motion.article>
  );
}

export function ArchivedRow({
  habit,
  onRestore,
}: {
  habit: ArchivedHabit;
  onRestore: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        HABIT_ROW,
        "opacity-[0.72] shadow-none hover:translate-y-0 hover:shadow-none",
      )}
    >
      <div
        className={HABIT_GLYPH}
        style={{ background: habit.tint }}
        aria-hidden
      >
        {habit.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/habits/${habit.id}`}
          className="text-[1.02rem] font-bold tracking-[-0.01em]"
        >
          {habit.title}
        </Link>
        <div className={cn(mono, "mt-1 flex flex-wrap items-center gap-2.5 text-[0.8rem] text-ink-50")}>
          <span>{habit.schedule}</span>
          <span>
            {habit.rate}% · {habit.bestLabel}
          </span>
          <span>Archived {habit.archivedAt}</span>
        </div>
      </div>
      <button
        type="button"
        className={cn(btn, btnGhost, btnSm)}
        onClick={() => onRestore(habit.id)}
      >
        Restore
      </button>
    </div>
  );
}

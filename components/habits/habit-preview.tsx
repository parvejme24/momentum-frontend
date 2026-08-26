"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";

import {
  computeDueGrid,
  formatScheduleLabel,
  measureMeta,
  PREVIEW_DAYS,
  PREVIEW_WEEKS,
  tintForColor,
  type ColorId,
  type HabitType,
  type ScheduleInput,
} from "@/components/habits/schedule-utils";
import { card, hint, mono, panelHead, sectionTitle } from "@/lib/ui";
import { cn } from "@/lib/utils";

const HABIT_ROW =
  "group mb-4 flex items-center gap-4 rounded-lg border border-ink/9 bg-linear-to-br from-[color-mix(in_srgb,var(--paper-white)_92%,var(--blue-soft))] to-paper-raised px-[18px] py-4 shadow-none transition-[transform,box-shadow,background,opacity] duration-normal ease-smooth hover:translate-y-0 hover:shadow-none dark:from-[color-mix(in_srgb,var(--paper-white)_85%,var(--blue-soft))] dark:to-paper-raised";

const HABIT_GLYPH =
  "grid size-11 shrink-0 place-items-center overflow-hidden rounded-md border border-ink/9 text-[1.15rem]";

const MARK =
  "relative grid size-[46px] shrink-0 cursor-default place-items-center rounded-md border border-ink/9 bg-paper-white pointer-events-none";

const MARK_SVG =
  "size-6 fill-none stroke-solid-white [stroke-dasharray:32] [stroke-dashoffset:32] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:3.2]";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={MARK_SVG}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function PreviewHeatmap({ dueGrid }: { dueGrid: boolean[] }) {
  const reduce = useReducedMotion();
  const columns = useMemo(() => {
    const cols: boolean[][] = [];
    for (let w = 0; w < PREVIEW_WEEKS; w++) {
      cols.push(dueGrid.slice(w * PREVIEW_DAYS, w * PREVIEW_DAYS + PREVIEW_DAYS));
    }
    return cols;
  }, [dueGrid]);

  return (
    <div className="mx-[-2px] overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
      <div
        className="flex w-max flex-row gap-[3px]"
        role="img"
        aria-label="Next eight weeks: solid squares are due days, hatched squares are rest days"
      >
        {columns.map((col, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {col.map((due, di) => (
              <motion.i
                key={`${wi}-${di}-${due ? "due" : "rest"}`}
                className={cn(
                  "size-[13px] rounded-[2px] border border-[rgba(20,26,46,0.07)] bg-l0 transition-transform duration-instant ease-smooth hover:scale-[1.45] hover:border-ink",
                  due
                    ? "bg-l2"
                    : "bg-[repeating-linear-gradient(45deg,var(--rule)_0_2px,transparent_2px_4px)]",
                )}
                initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 480,
                        damping: 24,
                        mass: 0.32,
                        delay: wi * 0.012 + di * 0.008,
                      }
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HabitPreview({
  name,
  icon,
  colorId,
  habitType,
  schedule,
  measureTarget,
  measureUnit,
}: {
  name: string;
  icon: string;
  colorId: ColorId;
  habitType: HabitType;
  schedule: ScheduleInput;
  measureTarget: string;
  measureUnit: string;
}) {
  const title = name.trim() || "Your new habit";
  const scheduleLabel = formatScheduleLabel(schedule, habitType);
  const measure = measureMeta(measureTarget, measureUnit);
  const dueGrid = useMemo(() => computeDueGrid(schedule), [schedule]);
  const tint = tintForColor(colorId);

  const metaParts = [scheduleLabel, measure].filter(Boolean);

  return (
    <div className="grid gap-4">
      <div className={cn(card, "p-[18px]")}>
        <div className={panelHead}>
          <h2 className={sectionTitle}>Preview</h2>
        </div>

        <article className={HABIT_ROW}>
          <div
            className={HABIT_GLYPH}
            style={{ background: tint }}
            aria-hidden
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[1.02rem] font-bold tracking-[-0.01em]">
              {title}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2.5 text-[0.8rem] text-ink-50">
              <span className="inline-flex items-center gap-[5px] font-mono text-[0.78rem] font-bold text-ink-30">
                <Flame size={13} aria-hidden />
                <span className={mono}>0 days</span>
              </span>
              {metaParts.map((part) => (
                <span key={part}>{part}</span>
              ))}
            </div>
          </div>
          <div className={MARK} aria-hidden>
            <CheckIcon />
          </div>
        </article>

        <p
          className={cn(
            mono,
            "mb-2.5 text-[0.68rem] font-semibold tracking-[0.1em] text-ink-50 uppercase",
          )}
        >
          Your next 8 weeks
        </p>
        <PreviewHeatmap dueGrid={dueGrid} />
        <p className={cn(hint, "mt-2.5 text-[0.78rem] leading-[1.45]")}>
          Solid squares are days you&apos;ll be due. Hatched ones are rest days
          — they can&apos;t break the chain.
        </p>
      </div>

      <div className="rounded-lg border border-ink/9 bg-blue-soft px-[18px] py-4 shadow-paper-sm">
        <h3 className="m-0 font-heading text-[1.02rem] font-extrabold tracking-[-0.02em] text-blue-deep">
          Start smaller than feels right
        </h3>
        <p className="mt-2 text-[0.88rem] leading-[1.5] text-ink-70">
          Ten pages beats thirty on day one. Raise the target once the chain
          holds.
        </p>
      </div>
    </div>
  );
}

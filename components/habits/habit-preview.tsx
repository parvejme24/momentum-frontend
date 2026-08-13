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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
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
    <div className="heat-scroll habit-preview-heat">
      <div
        className="heat heat-motion"
        role="img"
        aria-label="Next eight weeks: solid squares are due days, hatched squares are rest days"
      >
        {columns.map((col, wi) => (
          <div key={wi} className="heat-col">
            {col.map((due, di) => (
              <motion.i
                key={`${wi}-${di}-${due ? "due" : "rest"}`}
                className={due ? "cell l1 preview-due" : "cell skip"}
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
    <div className="new-habit-preview-stack">
      <div className="card new-habit-preview-card">
        <div className="panel-head">
          <h2 className="section-title">Preview</h2>
        </div>

        <article className="habit habit-preview-row">
          <div
            className="habit-glyph"
            style={{ background: tint }}
            aria-hidden
          >
            {icon}
          </div>
          <div className="habit-body">
            <div className="habit-title">{title}</div>
            <div className="habit-meta">
              <span className="streak cold">
                <Flame size={13} aria-hidden />
                <span className="mono">0 days</span>
              </span>
              {metaParts.map((part) => (
                <span key={part}>{part}</span>
              ))}
            </div>
          </div>
          <div className="mark preview-mark" aria-hidden>
            <CheckIcon />
          </div>
        </article>

        <p className="mono preview-section-label">Your next 8 weeks</p>
        <PreviewHeatmap dueGrid={dueGrid} />
        <p className="preview-caption">
          Solid squares are days you&apos;ll be due. Hatched ones are rest days
          — they can&apos;t break the chain.
        </p>
      </div>

      <div className="tip-card">
        <h3 className="tip-card-title">Start smaller than feels right</h3>
        <p className="tip-card-copy">
          Ten pages beats thirty on day one. Raise the target once the chain
          holds.
        </p>
      </div>
    </div>
  );
}

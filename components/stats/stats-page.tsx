"use client";

import { useMemo, useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { HabitMiniHeatmap } from "@/components/habits/habit-mini-heatmap";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { ConsistencyTrendChart } from "@/components/stats/consistency-trend-chart";
import { WeekdayRateChart } from "@/components/stats/weekday-rate-chart";
import {
  RANGE_TABS,
  WEEKDAY_LABELS,
  type RangeKey,
} from "@/components/stats/sample-data";
import { StatsPageSkeleton } from "@/components/ui/page-skeletons";
import { ApiError } from "@/lib/api/errors";
import type { StatsRange } from "@/lib/api/types";
import { formatPrettyIso } from "@/lib/dates";
import { useOverviewStats } from "@/lib/stats/hooks";
import {
  lastWeekRates,
  overviewCompare,
  overviewInsights,
  overviewMilestones,
  overviewSummary,
  weekdayRatesInOrder,
} from "@/lib/stats/map";
import {
  card,
  cardHover,
  chip,
  chipBlue,
  chipFlame,
  eyebrow,
  hint,
  hintErr,
  mono,
  pageHead,
  panelHead,
  sectionTitle,
  stat,
  statK,
  statN,
  statV,
  tabBar,
  tabs,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

function asStatsRange(range: RangeKey): StatsRange {
  return range;
}

const HEAT_SWATCH =
  "block size-3 rounded-[2px] border border-[rgba(20,26,46,0.07)]";

const HABIT_GLYPH =
  "grid size-11 shrink-0 place-items-center overflow-hidden rounded-md border border-ink/9 text-[1.15rem]";

function HeatLegend() {
  return (
    <div
      className="flex items-center gap-1.5 font-mono text-[0.68rem] text-ink-50"
      aria-hidden
    >
      <span>Less</span>
      <i className={cn(HEAT_SWATCH, "bg-l0")} />
      <i className={cn(HEAT_SWATCH, "bg-l1")} />
      <i className={cn(HEAT_SWATCH, "bg-l2")} />
      <i className={cn(HEAT_SWATCH, "bg-l3")} />
      <i className={cn(HEAT_SWATCH, "bg-l4")} />
      <span>More</span>
    </div>
  );
}

export function StatsPage() {
  const reduce = useReducedMotion();
  const [range, setRange] = useState<RangeKey>("90d");
  const statsQuery = useOverviewStats(asStatsRange(range));
  const data = statsQuery.data;

  const summary = useMemo(
    () => (data ? overviewSummary(data) : []),
    [data],
  );
  const weeks = useMemo(
    () => lastWeekRates(data?.byWeek ?? []),
    [data?.byWeek],
  );
  const weekdays = useMemo(
    () => weekdayRatesInOrder(data?.byWeekday ?? []),
    [data?.byWeekday],
  );
  const compare = useMemo(
    () => (data ? overviewCompare(data) : []),
    [data],
  );
  const milestones = useMemo(
    () => (data ? overviewMilestones(data) : []),
    [data],
  );
  const insights = useMemo(
    () => (data ? overviewInsights(data) : []),
    [data],
  );

  const strongestIndex = weekdays.length
    ? weekdays.indexOf(Math.max(...weekdays))
    : -1;
  const weakestIndex = weekdays.length
    ? weekdays.indexOf(Math.min(...weekdays))
    : -1;
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const strongestDay = strongestIndex >= 0 ? dayNames[strongestIndex] : null;
  const weakestDay = weakestIndex >= 0 ? dayNames[weakestIndex] : null;

  const last = weeks.at(-1);
  const prev = weeks.at(-2);
  const delta =
    last != null && prev != null ? Math.round((last - prev) * 100) : 0;

  if (statsQuery.isLoading) {
    return <StatsPageSkeleton />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <motion.header
          className={cn(pageHead, "block")}
          variants={reduce ? undefined : fadeUpSoft}
        >
          <p className={cn(eyebrow, "mb-2")}>
            {data ? `Since ${formatPrettyIso(data.range.from)}` : "Stats"}
          </p>
          <div className="flex items-baseline justify-between gap-6 max-nav:flex-wrap">
            <h1 className="mb-0">Stats</h1>
            <div
              className={cn(tabBar, "shrink-0 justify-end max-nav:ml-auto")}
              role="tablist"
              aria-label="Date range"
            >
              {RANGE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={range === tab.id}
                  className={tabs(range === tab.id)}
                  onClick={() => setRange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.header>

        {statsQuery.error ? (
          <p className={cn(hint, hintErr)}>
            {statsQuery.error instanceof ApiError
              ? statsQuery.error.message
              : "Could not load stats"}
          </p>
        ) : null}

        <motion.section
          className="mb-[22px] grid grid-cols-2 gap-6 wide:grid-cols-4"
          aria-label="Summary"
          variants={reduce ? undefined : fadeUpSoft}
        >
          {summary.map((tile) => (
            <article key={tile.key} className={cn(stat, cardHover)}>
              <div className={statK}>{tile.key}</div>
              <div className={cn(statV, tile.flame && "text-flame")}>
                {tile.value}
              </div>
              <div className={statN}>{tile.note}</div>
            </article>
          ))}
        </motion.section>

        <motion.section
          className="mt-[22px] grid grid-cols-1 items-stretch gap-6 nav:grid-cols-2"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <article className={cn(card, "flex h-full min-h-0 min-w-0 flex-col")}>
            <div className={cn(panelHead, "mb-3.5")}>
              <div>
                <h2 className={sectionTitle}>Consistency</h2>
                <p className={cn(hint, "mt-1")}>All habits, last 12 weeks</p>
              </div>
            </div>
            <div className="min-w-0">
              {weeks.length > 0 ? (
                <ConsistencyTrendChart
                  rates={weeks}
                  ariaLabel="Consistency over the last 12 weeks"
                  animateKey={range}
                />
              ) : (
                <p className={cn(hint, "m-0 flex h-[220px] w-full items-center")}>
                  Weekly completion appears after you log days.
                </p>
              )}
            </div>
            <div className="mt-0 flex min-h-[2.75rem] flex-wrap content-center items-center gap-2 overflow-visible border-t border-ink/8 pt-3 dark:border-ink/8">
              {delta !== 0 ? (
                <span className={cn(chip, chipBlue)}>
                  {delta > 0 ? `↗ up ${delta}` : `↘ down ${Math.abs(delta)}`} points
                </span>
              ) : (
                <span className="block min-h-[1.75rem] w-full" aria-hidden />
              )}
            </div>
          </article>

          <article className={cn(card, "flex h-full min-h-0 min-w-0 flex-col")}>
            <div className={cn(panelHead, "mb-0 pb-3")}>
              <div>
                <h2 className={sectionTitle}>Your week</h2>
                <p className={cn(hint, "mt-1")}>Completion rate by weekday</p>
              </div>
            </div>
            <div className="min-w-0">
              {weekdays.some((rate) => rate > 0) ? (
                <WeekdayRateChart
                  rates={weekdays}
                  labels={WEEKDAY_LABELS}
                  ariaLabel="Completion rate by weekday"
                  animateKey={range}
                  strongestIndex={strongestIndex}
                  weakestIndex={weakestIndex}
                />
              ) : (
                <p className={cn(hint, "m-0 flex h-[220px] w-full items-center")}>
                  Weekday rates fill in as you log days.
                </p>
              )}
            </div>
            <div className="mt-0 flex min-h-[2.75rem] flex-wrap content-center items-center gap-2 overflow-visible border-t border-ink/8 pt-3">
              {weekdays.some((rate) => rate > 0) ? (
                <>
                  {strongestDay ? (
                    <span className={cn(chip, chipBlue)}>Strongest — {strongestDay}</span>
                  ) : null}
                  {weakestDay ? (
                    <span className={cn(chip, chipFlame)}>Weakest — {weakestDay}</span>
                  ) : null}
                </>
              ) : (
                <span className="block min-h-[1.75rem] w-full" aria-hidden />
              )}
            </div>
          </article>
        </motion.section>

        <motion.section
          className={cn(card, "mt-[22px]")}
          aria-labelledby="compare-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className={cn(panelHead, "max-nav:flex-col max-nav:items-start")}>
            <div>
              <h2 id="compare-heading" className={sectionTitle}>
                Every habit, side by side
              </h2>
              <p className={cn(hint, "mt-1")}>Same range · same scale for all</p>
            </div>
            <HeatLegend />
          </div>

          {compare.length === 0 ? (
            <p className={hint}>Create a habit to compare chains.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 wide:grid-cols-2">
              {compare.map((habit) => (
                <div
                  key={habit.id}
                  className="flex min-w-0 flex-col gap-3 rounded-md border border-ink/9 bg-paper-white p-4 shadow-paper-sm dark:bg-paper-raised"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={HABIT_GLYPH}
                      style={{ background: habit.tint }}
                      aria-hidden
                    >
                      {habit.emoji}
                    </div>
                    <div className="min-w-0 flex-1 text-[1.02rem] font-bold tracking-[-0.01em]">
                      {habit.title}
                    </div>
                    <span
                      className={cn(
                        mono,
                        "shrink-0 text-[0.92rem] font-bold tracking-[-0.03em] text-ink-70",
                      )}
                    >
                      {habit.rate}%
                    </span>
                  </div>
                  <div className="w-full min-w-0">
                    <HabitMiniHeatmap
                      habitId={habit.id}
                      seed={habit.heatSeed}
                      fillRate={habit.fillRate}
                      activeWeekdays={habit.activeWeekdays}
                      label={habit.title}
                      weeks={26}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          className="mt-[22px] grid grid-cols-1 items-stretch gap-6 nav:grid-cols-2"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <article className={cn(card, "flex h-full min-h-0 flex-col self-stretch")}>
            <div className={cn(panelHead, "mb-3.5 shrink-0")}>
              <h2 className={sectionTitle}>Milestones</h2>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              {milestones.length === 0 ? (
                <p className={cn(hint, "m-0 flex flex-1 items-center")}>
                  Streaks will land here as chains grow.
                </p>
              ) : (
                <ul className="m-0 grid flex-1 list-none p-0">
                  {milestones.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 border-b border-ink/8 py-3.5 first:pt-0 last:border-b-0 last:pb-0"
                    >
                      <div
                        className={HABIT_GLYPH}
                        style={{ background: item.tint }}
                        aria-hidden
                      >
                        {item.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[1.02rem] font-bold tracking-[-0.01em]">
                          {item.title}
                        </div>
                        <p className={cn(hint, "mt-0.5")}>{item.detail}</p>
                      </div>
                      <span
                        className={cn(
                          mono,
                          "shrink-0 text-[0.72rem] font-semibold whitespace-nowrap text-ink-50",
                        )}
                      >
                        {item.when}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>

          <article className={cn(card, "flex h-full min-h-0 flex-col self-stretch")}>
            <div className={cn(panelHead, "mb-3.5 shrink-0")}>
              <h2 className={sectionTitle}>What the numbers say</h2>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              {insights.length === 0 ? (
                <p className={cn(hint, "m-0 flex flex-1 items-center")}>
                  Log a few days to get a read.
                </p>
              ) : (
                <div className="grid flex-1 gap-3">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={cn(
                        "rounded-md border border-ink/9 border-l-[5px] bg-paper-white px-4 py-3.5",
                        insight.accent === "flame" &&
                          "border-l-flame bg-flame-soft",
                        insight.accent === "blue" &&
                          "border-l-blue bg-blue-soft",
                        insight.accent === "quiet" &&
                          "border-l-ink bg-[color-mix(in_srgb,var(--rule)_55%,var(--paper-white))]",
                      )}
                    >
                      <h3 className="m-0 font-heading text-[1.02rem] font-extrabold tracking-[-0.02em]">
                        {insight.title}
                      </h3>
                      <p className="mt-2 text-[0.88rem] leading-[1.5] text-ink-70">
                        {insight.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>
        </motion.section>
      </motion.div>
    </MotionConfig>
  );
}

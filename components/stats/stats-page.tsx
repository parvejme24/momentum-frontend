"use client";

import { useMemo, useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { MiniHeatmap } from "@/components/habits/mini-heatmap";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { RateBars } from "@/components/stats/rate-bars";
import {
  RANGE_TABS,
  WEEKDAY_LABELS,
  type RangeKey,
} from "@/components/stats/sample-data";
import { PageSpinner } from "@/components/ui/page-spinner";
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

function consistencyLabels(count: number) {
  return Array.from({ length: count }, (_, i) => {
    if (i === 0) return "12w";
    if (i === count - 1) return "Now";
    return "";
  });
}

function asStatsRange(range: RangeKey): StatsRange {
  return range;
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
    return <PageSpinner label="Loading stats" />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <motion.header
          className="page-head stats-head"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <p className="eyebrow">
            {data
              ? `Since ${formatPrettyIso(data.range.from)}`
              : "Stats"}
          </p>
          <div className="stats-title-row">
            <h1>Stats</h1>
            <div className="tab-bar" role="tablist" aria-label="Date range">
              {RANGE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={range === tab.id}
                  className={range === tab.id ? "tab active" : "tab"}
                  onClick={() => setRange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.header>

        {statsQuery.error ? (
          <p className="hint hint-err">
            {statsQuery.error instanceof ApiError
              ? statsQuery.error.message
              : "Could not load stats"}
          </p>
        ) : null}

        <motion.section
          className="grid-4 stats-summary"
          aria-label="Summary"
          variants={reduce ? undefined : fadeUpSoft}
        >
          {summary.map((tile) => (
            <article key={tile.key} className="stat card-hover">
              <div className="stat-k">{tile.key}</div>
              <div className={tile.flame ? "stat-v flame" : "stat-v"}>
                {tile.value}
              </div>
              <div className="stat-n">{tile.note}</div>
            </article>
          ))}
        </motion.section>

        <motion.section
          className="grid-2 stats-charts"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <article className="card">
            <div className="panel-head">
              <div>
                <h2 className="section-title">Consistency</h2>
                <p className="hint" style={{ marginTop: 4 }}>
                  All habits, last 12 weeks
                </p>
              </div>
              {delta !== 0 ? (
                <span className="chip chip-blue">
                  {delta > 0 ? `↗ up ${delta}` : `↘ down ${Math.abs(delta)}`} points
                </span>
              ) : null}
            </div>
            {weeks.length > 0 ? (
              <RateBars
                rates={weeks}
                labels={consistencyLabels(weeks.length)}
                ariaLabel="Consistency over the last 12 weeks"
                animateKey={range}
              />
            ) : (
              <p className="hint">Weekly completion appears after you log days.</p>
            )}
          </article>

          <article className="card">
            <div className="panel-head">
              <div>
                <h2 className="section-title">Your week</h2>
                <p className="hint" style={{ marginTop: 4 }}>
                  Completion rate by weekday
                </p>
              </div>
            </div>
            {weekdays.some((rate) => rate > 0) ? (
              <>
                <RateBars
                  rates={weekdays}
                  labels={WEEKDAY_LABELS}
                  ariaLabel="Completion rate by weekday"
                  hotThreshold={0.8}
                  animateKey={range}
                />
                <div className="stats-week-foot">
                  {strongestDay ? (
                    <span className="chip chip-blue">Strongest — {strongestDay}</span>
                  ) : null}
                  {weakestDay ? (
                    <span className="chip chip-flame">Weakest — {weakestDay}</span>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="hint">Weekday rates fill in as you log days.</p>
            )}
          </article>
        </motion.section>

        <motion.section
          className="card stats-compare"
          aria-labelledby="compare-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className="panel-head">
            <div>
              <h2 id="compare-heading" className="section-title">
                Every habit, side by side
              </h2>
              <p className="hint" style={{ marginTop: 4 }}>
                Same range · same scale for all
              </p>
            </div>
            <div className="heat-legend" aria-hidden>
              <span>Less</span>
              <i style={{ background: "var(--l0)" }} />
              <i style={{ background: "var(--l1)" }} />
              <i style={{ background: "var(--l2)" }} />
              <i style={{ background: "var(--l3)" }} />
              <i style={{ background: "var(--l4)" }} />
              <span>More</span>
            </div>
          </div>

          {compare.length === 0 ? (
            <p className="hint">Create a habit to compare chains.</p>
          ) : (
            <div className="stats-compare-list">
              {compare.map((habit) => (
                <div key={habit.id} className="stats-compare-row">
                  <div className="stats-compare-meta">
                    <div
                      className="habit-glyph"
                      style={{ background: habit.tint }}
                      aria-hidden
                    >
                      {habit.emoji}
                    </div>
                    <div className="habit-title">{habit.title}</div>
                    <span className="mono stats-compare-rate">{habit.rate}%</span>
                  </div>
                  <MiniHeatmap
                    seed={habit.heatSeed}
                    fillRate={habit.fillRate}
                    activeWeekdays={habit.activeWeekdays}
                    label={habit.title}
                    weeks={26}
                  />
                </div>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          className="grid-2 stats-bottom"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <article className="card">
            <div className="panel-head">
              <h2 className="section-title">Milestones</h2>
            </div>
            {milestones.length === 0 ? (
              <p className="hint">Streaks will land here as chains grow.</p>
            ) : (
              <ul className="milestone-list">
                {milestones.map((item) => (
                  <li key={item.id} className="milestone-row">
                    <div
                      className="habit-glyph"
                      style={{ background: item.tint }}
                      aria-hidden
                    >
                      {item.emoji}
                    </div>
                    <div className="milestone-copy">
                      <div className="habit-title">{item.title}</div>
                      <p className="hint" style={{ marginTop: 2 }}>
                        {item.detail}
                      </p>
                    </div>
                    <span className="mono milestone-when">{item.when}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="card">
            <div className="panel-head">
              <h2 className="section-title">What the numbers say</h2>
            </div>
            {insights.length === 0 ? (
              <p className="hint">Log a few days to get a read.</p>
            ) : (
              <div className="insight-list">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`insight insight-${insight.accent}`}
                  >
                    <h3 className="insight-title">{insight.title}</h3>
                    <p className="insight-body">{insight.body}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        </motion.section>
      </motion.div>
    </MotionConfig>
  );
}

"use client";

import { useMemo, useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { MiniHeatmap } from "@/components/habits/mini-heatmap";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { RateBars } from "@/components/stats/rate-bars";
import {
  COMPARE_HABITS,
  consistencyRates,
  INSIGHTS,
  MILESTONES,
  RANGE_TABS,
  summaryForRange,
  WEEKDAY_LABELS,
  weekdayRates,
  type RangeKey,
} from "@/components/stats/sample-data";

function consistencyLabels(count: number) {
  return Array.from({ length: count }, (_, i) => {
    if (i === 0) return "12w";
    if (i === count - 1) return "Now";
    return "";
  });
}

export function StatsPage() {
  const reduce = useReducedMotion();
  const [range, setRange] = useState<RangeKey>("90d");

  const summary = useMemo(() => summaryForRange(range), [range]);
  const weeks = useMemo(() => consistencyRates(range), [range]);
  const weekdays = useMemo(() => weekdayRates(range), [range]);

  const strongestIndex = weekdays.indexOf(Math.max(...weekdays));
  const weakestIndex = weekdays.indexOf(Math.min(...weekdays));
  const strongestDay =
    ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
      strongestIndex
    ];
  const weakestDay =
    ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
      weakestIndex
    ];

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <motion.header
          className="page-head row-between stats-head"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div>
            <p className="eyebrow">Since 12 August 2025</p>
            <h1>Stats</h1>
          </div>
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
        </motion.header>

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
              <span className="chip chip-blue">↗ up 9 points</span>
            </div>
            <RateBars
              rates={weeks}
              labels={consistencyLabels(weeks.length)}
              ariaLabel="Consistency over the last 12 weeks"
              animateKey={range}
            />
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
            <RateBars
              rates={weekdays}
              labels={WEEKDAY_LABELS}
              ariaLabel="Completion rate by weekday"
              hotThreshold={0.8}
              animateKey={range}
            />
            <div className="stats-week-foot">
              <span className="chip chip-blue">Strongest — {strongestDay}</span>
              <span className="chip chip-flame">Weakest — {weakestDay}</span>
            </div>
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
                Last 26 weeks · same scale for all
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

          <div className="stats-compare-list">
            {COMPARE_HABITS.map((habit) => (
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
        </motion.section>

        <motion.section
          className="grid-2 stats-bottom"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <article className="card">
            <div className="panel-head">
              <h2 className="section-title">Milestones</h2>
            </div>
            <ul className="milestone-list">
              {MILESTONES.map((item) => (
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
          </article>

          <article className="card">
            <div className="panel-head">
              <h2 className="section-title">What the numbers say</h2>
            </div>
            <div className="insight-list">
              {INSIGHTS.map((insight) => (
                <div
                  key={insight.id}
                  className={`insight insight-${insight.accent}`}
                >
                  <h3 className="insight-title">{insight.title}</h3>
                  <p className="insight-body">{insight.body}</p>
                </div>
              ))}
            </div>
          </article>
        </motion.section>
      </motion.div>
    </MotionConfig>
  );
}

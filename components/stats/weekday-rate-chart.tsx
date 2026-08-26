"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReducedMotion } from "framer-motion";

import {
  ChartBox,
  ChartTooltip,
  chartTick,
} from "@/components/stats/chart-box";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type DayPoint = {
  label: string;
  title: string;
  rate: number;
  fill: string;
};

function barFill(
  index: number,
  strongestIndex: number,
  weakestIndex: number,
): string {
  if (index === strongestIndex) return "var(--blue)";
  if (index === weakestIndex && strongestIndex !== weakestIndex) {
    return "var(--flame)";
  }
  return "var(--blue-soft)";
}

export function WeekdayRateChart({
  rates,
  labels,
  ariaLabel,
  animateKey,
  strongestIndex = -1,
  weakestIndex = -1,
}: {
  rates: number[];
  labels: string[];
  ariaLabel: string;
  animateKey?: string | number;
  strongestIndex?: number;
  weakestIndex?: number;
}) {
  const reduce = useReducedMotion();
  const data = useMemo<DayPoint[]>(
    () =>
      rates.map((rate, index) => ({
        label: labels[index] ?? DAY_NAMES[index]?.slice(0, 2) ?? "",
        title: DAY_NAMES[index] ?? labels[index] ?? "",
        rate: Math.round(Math.min(1, Math.max(0, rate)) * 100),
        fill: barFill(index, strongestIndex, weakestIndex),
      })),
    [labels, rates, strongestIndex, weakestIndex],
  );

  return (
    <div className="h-full min-h-0 w-full min-w-0" aria-label={ariaLabel}>
      <ChartBox height={220}>
        {({ width, height }) => (
          <BarChart
            key={animateKey ?? "weekday"}
            width={width}
            height={height}
            data={data}
            margin={{ top: 10, right: 6, left: -16, bottom: 0 }}
            barCategoryGap="16%"
          >
            <CartesianGrid
              stroke="var(--rule)"
              strokeDasharray="3 4"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={chartTick}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              axisLine={false}
              tickLine={false}
              width={36}
              tick={chartTick}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "var(--ink-12)" }}
            />
            <Bar
              dataKey="rate"
              maxBarSize={36}
              radius={[4, 4, 0, 0]}
              background={{ fill: "var(--l0)", radius: 4 }}
              isAnimationActive={!reduce}
              animationDuration={reduce ? 0 : 650}
            >
              {data.map((entry) => (
                <Cell key={entry.title} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ChartBox>
    </div>
  );
}

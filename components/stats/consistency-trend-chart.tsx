"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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

type WeekPoint = {
  label: string;
  title: string;
  rate: number;
};

function buildPoints(rates: number[]): WeekPoint[] {
  const total = rates.length;
  return rates.map((rate, index) => ({
    label: index === 0 ? "12w" : index === total - 1 ? "Now" : "",
    title:
      index === total - 1
        ? "This week"
        : index === 0
          ? "12 weeks ago"
          : `Week ${index + 1}`,
    rate: Math.round(Math.min(1, Math.max(0, rate)) * 100),
  }));
}

export function ConsistencyTrendChart({
  rates,
  ariaLabel,
  animateKey,
}: {
  rates: number[];
  ariaLabel: string;
  animateKey?: string | number;
}) {
  const reduce = useReducedMotion();
  const data = useMemo(() => buildPoints(rates), [rates]);

  return (
    <div className="h-full min-h-0 w-full min-w-0" aria-label={ariaLabel}>
      <ChartBox height={220}>
        {({ width, height }) => (
          <BarChart
            key={animateKey ?? "consistency"}
            width={width}
            height={height}
            data={data}
            margin={{ top: 10, right: 6, left: -16, bottom: 0 }}
            barCategoryGap="18%"
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
              fill="var(--blue)"
              maxBarSize={22}
              radius={[4, 4, 0, 0]}
              background={{ fill: "var(--l0)", radius: 4 }}
              isAnimationActive={!reduce}
              animationDuration={reduce ? 0 : 700}
            />
          </BarChart>
        )}
      </ChartBox>
    </div>
  );
}

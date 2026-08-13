import type { Metadata } from "next";

import { StatsPage } from "@/components/stats/stats-page";

export const metadata: Metadata = {
  title: "Stats — Momentum",
  description: "Trends, weekday patterns, and every habit compared.",
};

export default function StatsRoutePage() {
  return <StatsPage />;
}

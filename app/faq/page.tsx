import type { Metadata } from "next";

import { FaqPage } from "@/components/marketing/faq-page";

export const metadata: Metadata = {
  title: "FAQ — Momentum",
  description:
    "Answers about Momentum habits, streaks, plans, export, and the year chain.",
};

export default function PublicFaqRoute() {
  return <FaqPage />;
}

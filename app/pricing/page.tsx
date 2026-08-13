import type { Metadata } from "next";

import { PricingPage } from "@/components/marketing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing — Momentum",
  description:
    "Free, Pro, and Team plans for Momentum — the logbook habit tracker with the year chain.",
};

export default function PublicPricingRoute() {
  return <PricingPage />;
}

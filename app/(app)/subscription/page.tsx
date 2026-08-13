import type { Metadata } from "next";

import { SubscriptionPage } from "@/components/billing/subscription-page";

export const metadata: Metadata = {
  title: "Subscription — Momentum",
  description: "Manage your Momentum plan, billing, and invoices.",
};

export default function SubscriptionRoutePage() {
  return <SubscriptionPage />;
}

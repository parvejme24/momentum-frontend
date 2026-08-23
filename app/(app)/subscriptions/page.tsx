import type { Metadata } from "next";

import { SubscriptionsPage } from "@/components/admin/subscriptions-page";

export const metadata: Metadata = {
  title: "Subscriptions — Momentum",
  description: "Admin view of Momentum subscriptions.",
};

export default function SubscriptionsRoutePage() {
  return <SubscriptionsPage />;
}

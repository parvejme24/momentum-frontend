import type { Metadata } from "next";

import { PlansPage } from "@/components/admin/plans-page";

export const metadata: Metadata = {
  title: "Plans — Momentum",
  description: "Admin catalog of Momentum pricing plans.",
};

export default function PlansRoutePage() {
  return <PlansPage />;
}

import type { Metadata } from "next";

import { PaymentsPage } from "@/components/admin/payments-page";

export const metadata: Metadata = {
  title: "Payments — Momentum",
  description: "Admin view of Momentum payments and revenue.",
};

export default function PaymentsRoutePage() {
  return <PaymentsPage />;
}

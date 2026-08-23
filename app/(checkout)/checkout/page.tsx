import type { Metadata } from "next";

import { CheckoutPage } from "@/components/billing/checkout-page";

export const metadata: Metadata = {
  title: "Checkout — Momentum",
  description: "Choose Stripe or SSLCommerz to upgrade your Momentum plan.",
};

export default function CheckoutRoutePage() {
  return <CheckoutPage />;
}

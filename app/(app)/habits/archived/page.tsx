import type { Metadata } from "next";

import { ArchivedPage } from "@/components/habits/archived-page";

export const metadata: Metadata = {
  title: "Archived habits — Momentum",
  description: "Restore archived habits or browse their history.",
};

export default function ArchivedRoutePage() {
  return <ArchivedPage />;
}

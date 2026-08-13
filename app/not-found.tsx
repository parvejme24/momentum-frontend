import type { Metadata } from "next";

import { NotFoundPage } from "@/components/not-found/not-found-page";

export const metadata: Metadata = {
  title: "Blank day — Momentum",
  description:
    "This page doesn’t exist — nothing was logged here. Habits and marked days are exactly where they were left.",
};

export default function NotFound() {
  return <NotFoundPage />;
}

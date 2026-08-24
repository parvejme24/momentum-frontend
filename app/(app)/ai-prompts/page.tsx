import type { Metadata } from "next";

import { AiPromptsPage } from "@/components/admin/ai-prompts-page";

export const metadata: Metadata = {
  title: "AI prompts — Momentum",
  description: "Admin catalog of Momentum AI prompt templates.",
};

export default function AiPromptsRoutePage() {
  return <AiPromptsPage />;
}

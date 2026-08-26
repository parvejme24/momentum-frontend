"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

import { AiUpgradePrompt } from "@/components/ai/ai-upgrade-prompt";
import { mutationErrorMessage } from "@/lib/admin/map";
import { useAiCreateHabit, useAiStatus } from "@/lib/ai/hooks";
import {
  prefillFromAiCreatedHabit,
  type AiHabitIdeaPrefill,
} from "@/lib/ai/map";
import { buttons, card, field, hint, hintErr, input, label, sectionTitle } from "@/lib/ui";
import { cn } from "@/lib/utils";

type AiCreateHabitPanelProps = {
  onApply: (prefill: AiHabitIdeaPrefill) => void;
};

export function AiCreateHabitPanel({ onApply }: AiCreateHabitPanelProps) {
  const statusQuery = useAiStatus();
  const createHabit = useAiCreateHabit();
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState<string | null>(null);

  const enabled = statusQuery.data?.enabled ?? false;

  if (statusQuery.isLoading) return null;
  if (!enabled) return <AiUpgradePrompt compact />;

  async function generate() {
    const trimmed = message.trim();
    if (!trimmed) return;
    try {
      const result = await createHabit.mutateAsync({ message: trimmed });
      setReason(result.reason);
      onApply(prefillFromAiCreatedHabit(result.habit, result.reason));
    } catch {
      setReason(null);
    }
  }

  return (
    <section className={cn(card, "mt-[18px]")} aria-labelledby="ai-create-heading">
      <div className="mb-3 flex items-center gap-2.5">
        <Sparkles size={16} strokeWidth={2.4} aria-hidden />
        <h2 id="ai-create-heading" className={cn(sectionTitle, "flex-1")}>
          Create with AI
        </h2>
      </div>
      <p className={cn(hint, "mb-3.5 mt-0 leading-[1.55]")}>
        Describe the habit in plain language. We’ll draft the form for you.
      </p>

      <label className={field}>
        <span className={label}>Describe the habit</span>
        <textarea
          className={input}
          rows={3}
          placeholder="I want to stretch for 10 minutes every morning…"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </label>

      <button
        type="button"
        className={buttons("primary", "block", "mt-4")}
        disabled={createHabit.isPending || !message.trim()}
        onClick={() => void generate()}
      >
        {createHabit.isPending ? (
          <>
            <LoaderCircle size={15} className="animate-payment-spin" aria-hidden />
            Drafting…
          </>
        ) : (
          "Draft habit"
        )}
      </button>

      {createHabit.isError ? (
        <p className={cn(hint, hintErr, "mt-3")}>
          {mutationErrorMessage(createHabit.error, "Could not draft habit")}
        </p>
      ) : null}

      {reason ? <p className={cn(hint, "mt-3")}>{reason}</p> : null}
    </section>
  );
}

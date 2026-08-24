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
    <section className="card ai-panel" aria-labelledby="ai-create-heading">
      <div className="ai-panel-head">
        <Sparkles size={16} strokeWidth={2.4} aria-hidden />
        <h2 id="ai-create-heading" className="section-title">
          Create with AI
        </h2>
      </div>
      <p className="hint ai-panel-copy">
        Describe the habit in plain language. We’ll draft the form for you.
      </p>

      <label className="field">
        <span className="label">Describe the habit</span>
        <textarea
          className="input"
          rows={3}
          placeholder="I want to stretch for 10 minutes every morning…"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </label>

      <button
        type="button"
        className="btn btn-primary btn-block"
        disabled={createHabit.isPending || !message.trim()}
        onClick={() => void generate()}
      >
        {createHabit.isPending ? (
          <>
            <LoaderCircle size={15} className="ai-spin" aria-hidden />
            Drafting…
          </>
        ) : (
          "Draft habit"
        )}
      </button>

      {createHabit.isError ? (
        <p className="hint hint-err" style={{ marginTop: 12 }}>
          {mutationErrorMessage(createHabit.error, "Could not draft habit")}
        </p>
      ) : null}

      {reason ? (
        <p className="hint" style={{ marginTop: 12 }}>
          {reason}
        </p>
      ) : null}
    </section>
  );
}

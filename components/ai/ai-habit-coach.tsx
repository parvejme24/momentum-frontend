"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, RefreshCw, Sparkles } from "lucide-react";

import { AiUpgradePrompt } from "@/components/ai/ai-upgrade-prompt";
import { mutationErrorMessage } from "@/lib/admin/map";
import type { AiHabitMessageInput } from "@/lib/api/types";
import { useAiHabitMessage, useAiStatus } from "@/lib/ai/hooks";

type AiHabitCoachProps = {
  habitId: string;
  context: AiHabitMessageInput["context"];
};

export function AiHabitCoach({ habitId, context }: AiHabitCoachProps) {
  const statusQuery = useAiStatus();
  const { mutateAsync, isPending, isError, error, reset } = useAiHabitMessage();
  const [message, setMessage] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const enabled = statusQuery.data?.enabled ?? false;

  useEffect(() => {
    if (!enabled || !habitId) return;
    let cancelled = false;
    void mutateAsync({ habitId, context })
      .then((result) => {
        if (!cancelled) setMessage(result.message);
      })
      .catch(() => {
        if (!cancelled) setMessage(null);
      });
    return () => {
      cancelled = true;
    };
  }, [context, enabled, habitId, mutateAsync, version]);

  if (statusQuery.isLoading) return null;
  if (!enabled) return <AiUpgradePrompt compact />;

  return (
    <section className="card ai-panel ai-panel-compact" aria-labelledby="ai-coach-heading">
      <div className="ai-panel-head">
        <Sparkles size={16} strokeWidth={2.4} aria-hidden />
        <h2 id="ai-coach-heading" className="section-title">
          AI coach
        </h2>
        <button
          type="button"
          className="btn btn-ghost btn-sm ai-panel-refresh"
          disabled={isPending}
          onClick={() => {
            reset();
            setVersion((value) => value + 1);
          }}
        >
          {isPending ? (
            <LoaderCircle size={14} className="ai-spin" aria-hidden />
          ) : (
            <RefreshCw size={14} aria-hidden />
          )}
          Refresh
        </button>
      </div>

      {isError ? (
        <p className="hint hint-err">
          {mutationErrorMessage(error, "Could not load coach message")}
        </p>
      ) : isPending && !message ? (
        <p className="hint ai-panel-loading">Writing your note…</p>
      ) : message ? (
        <p className="ai-coach-message">{message}</p>
      ) : (
        <p className="hint">No coach message yet.</p>
      )}
    </section>
  );
}

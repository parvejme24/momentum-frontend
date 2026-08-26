"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, RefreshCw, Sparkles } from "lucide-react";

import { AiUpgradePrompt } from "@/components/ai/ai-upgrade-prompt";
import { mutationErrorMessage } from "@/lib/admin/map";
import type { AiHabitMessageInput } from "@/lib/api/types";
import { useAiHabitMessage, useAiStatus } from "@/lib/ai/hooks";
import { buttons, card, hint, hintErr, sectionTitle } from "@/lib/ui";
import { cn } from "@/lib/utils";

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
    <section
      className={cn(card, "mb-[18px] mt-0")}
      aria-labelledby="ai-coach-heading"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <Sparkles size={16} strokeWidth={2.4} aria-hidden />
        <h2 id="ai-coach-heading" className={cn(sectionTitle, "flex-1")}>
          AI coach
        </h2>
        <button
          type="button"
          className={buttons("ghost", "sm", "ml-auto inline-flex items-center gap-1.5")}
          disabled={isPending}
          onClick={() => {
            reset();
            setVersion((value) => value + 1);
          }}
        >
          {isPending ? (
            <LoaderCircle size={14} className="animate-payment-spin" aria-hidden />
          ) : (
            <RefreshCw size={14} aria-hidden />
          )}
          Refresh
        </button>
      </div>

      {isError ? (
        <p className={cn(hint, hintErr)}>
          {mutationErrorMessage(error, "Could not load coach message")}
        </p>
      ) : isPending && !message ? (
        <p className={cn(hint, "mt-2")}>Writing your note…</p>
      ) : message ? (
        <p className="m-0 text-base leading-[1.6] text-ink">{message}</p>
      ) : (
        <p className={hint}>No coach message yet.</p>
      )}
    </section>
  );
}

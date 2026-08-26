"use client";

import Link from "next/link";
import { LoaderCircle, Pencil, Plus } from "lucide-react";

import { HabitIcon } from "@/components/habits/habit-icon";
import type { AiCreateHabitResponse } from "@/lib/api/types";
import { prefillFromAiCreatedHabit, stashAiHabitPrefill } from "@/lib/ai/map";
import { buttons, hint } from "@/lib/ui";
import { cn } from "@/lib/utils";

type AiChatHabitDraftProps = {
  draft: AiCreateHabitResponse;
  savedHabitId?: string;
  saving?: boolean;
  onSave: () => void;
};

const draftCard =
  "w-full rounded-[14px] border-2 border-[var(--ai-chat-edge-soft,var(--ink-12))] bg-paper-raised p-3 shadow-paper-sm dark:border-rule dark:shadow-none";

const draftTop = "flex items-start gap-2.5";

const draftIcon =
  "inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border-2 border-[var(--ai-chat-edge-soft,var(--ink-12))] bg-blue-soft dark:border-rule";

export function AiChatHabitDraft({
  draft,
  savedHabitId,
  saving = false,
  onSave,
}: AiChatHabitDraftProps) {
  const habit = draft.habit;

  function customize() {
    stashAiHabitPrefill(prefillFromAiCreatedHabit(habit, draft.reason));
  }

  if (savedHabitId) {
    return (
      <article
        className={cn(
          draftCard,
          "border-[color-mix(in_srgb,var(--blue)_35%,var(--ai-chat-edge-soft,var(--ink-12)))]",
        )}
      >
        <div className={draftTop}>
          <span className={draftIcon} aria-hidden>
            <HabitIcon
              icon={habit.icon}
              size={16}
              className="inline-flex size-full items-center justify-center"
              glyphClassName="block text-[1.05rem] leading-none"
            />
          </span>
          <div>
            <p className="m-0 font-bold tracking-[-0.01em]">{habit.title}</p>
            <p className={cn(hint, "mt-1 leading-[1.45]")}>Saved to your habits</p>
          </div>
        </div>
        <Link
          href={`/habits/${savedHabitId}`}
          className={buttons("ghost", "sm", "mt-3 w-full")}
        >
          View habit
        </Link>
      </article>
    );
  }

  return (
    <article className={draftCard}>
      <div className={draftTop}>
        <span
          className={draftIcon}
          style={{ background: habit.color || undefined }}
          aria-hidden
        >
          <HabitIcon
            icon={habit.icon}
            size={16}
            className="inline-flex size-full items-center justify-center"
            glyphClassName="block text-[1.05rem] leading-none"
          />
        </span>
        <div>
          <p className="m-0 font-bold tracking-[-0.01em]">{habit.title}</p>
          <p className={cn(hint, "mt-1 leading-[1.45]")}>{habit.description}</p>
        </div>
      </div>
      {draft.reason ? (
        <p className={cn(hint, "mt-2.5 leading-[1.45]")}>{draft.reason}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={buttons("primary", "sm")}
          disabled={saving}
          onClick={onSave}
        >
          {saving ? (
            <LoaderCircle size={14} className="animate-payment-spin" aria-hidden />
          ) : (
            <Plus size={14} aria-hidden />
          )}
          Save habit
        </button>
        <Link
          href="/habits/new"
          className={buttons("ghost", "sm")}
          onClick={customize}
        >
          <Pencil size={14} aria-hidden />
          Customize
        </Link>
      </div>
    </article>
  );
}

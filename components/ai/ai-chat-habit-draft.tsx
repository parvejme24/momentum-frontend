"use client";

import Link from "next/link";
import { LoaderCircle, Pencil, Plus } from "lucide-react";

import { HabitIcon } from "@/components/habits/habit-icon";
import type { AiCreateHabitResponse } from "@/lib/api/types";
import { prefillFromAiCreatedHabit, stashAiHabitPrefill } from "@/lib/ai/map";

type AiChatHabitDraftProps = {
  draft: AiCreateHabitResponse;
  savedHabitId?: string;
  saving?: boolean;
  onSave: () => void;
};

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
      <article className="ai-chat-habit-draft is-saved">
        <div className="ai-chat-habit-draft-top">
          <span
            className="ai-chat-habit-draft-icon"
            aria-hidden
          >
            <HabitIcon icon={habit.icon} size={16} />
          </span>
          <div>
            <p className="ai-chat-habit-draft-title">{habit.title}</p>
            <p className="hint ai-chat-habit-draft-meta">Saved to your habits</p>
          </div>
        </div>
        <Link href={`/habits/${savedHabitId}`} className="btn btn-ghost btn-sm btn-block">
          View habit
        </Link>
      </article>
    );
  }

  return (
    <article className="ai-chat-habit-draft">
      <div className="ai-chat-habit-draft-top">
        <span
          className="ai-chat-habit-draft-icon"
          style={{ background: habit.color || undefined }}
          aria-hidden
        >
          <HabitIcon icon={habit.icon} size={16} />
        </span>
        <div>
          <p className="ai-chat-habit-draft-title">{habit.title}</p>
          <p className="hint ai-chat-habit-draft-meta">
            {habit.description}
          </p>
        </div>
      </div>
      {draft.reason ? (
        <p className="hint ai-chat-habit-draft-reason">{draft.reason}</p>
      ) : null}
      <div className="ai-chat-habit-draft-actions">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? (
            <LoaderCircle size={14} className="ai-spin" aria-hidden />
          ) : (
            <Plus size={14} aria-hidden />
          )}
          Save habit
        </button>
        <Link
          href="/habits/new"
          className="btn btn-ghost btn-sm"
          onClick={customize}
        >
          <Pencil size={14} aria-hidden />
          Customize
        </Link>
      </div>
    </article>
  );
}

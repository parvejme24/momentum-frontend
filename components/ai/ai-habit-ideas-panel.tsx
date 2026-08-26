"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

import { AiUpgradePrompt } from "@/components/ai/ai-upgrade-prompt";
import { mutationErrorMessage } from "@/lib/admin/map";
import type { AiHabitIdea } from "@/lib/api/types";
import { useAiHabitIdeas, useAiStatus } from "@/lib/ai/hooks";
import { prefillFromAiHabitIdea, type AiHabitIdeaPrefill } from "@/lib/ai/map";
import { buttons, card, field, hint, hintErr, input, label, mono, sectionTitle } from "@/lib/ui";
import { cn } from "@/lib/utils";

type AiHabitIdeasPanelProps = {
  onApply: (prefill: AiHabitIdeaPrefill) => void;
};

export function AiHabitIdeasPanel({ onApply }: AiHabitIdeasPanelProps) {
  const statusQuery = useAiStatus();
  const ideasMutation = useAiHabitIdeas();
  const [goal, setGoal] = useState("");
  const [interests, setInterests] = useState("");
  const [ideas, setIdeas] = useState<AiHabitIdea[]>([]);

  const enabled = statusQuery.data?.enabled ?? false;

  if (statusQuery.isLoading) return null;
  if (!enabled) return <AiUpgradePrompt />;

  async function generate() {
    try {
      const result = await ideasMutation.mutateAsync({
        goal: goal.trim() || undefined,
        interests: interests.trim() || undefined,
        count: 3,
      });
      setIdeas(result.ideas);
    } catch {
      setIdeas([]);
    }
  }

  return (
    <section className={cn(card, "mt-[18px]")} aria-labelledby="ai-ideas-heading">
      <div className="mb-3 flex items-center gap-2.5">
        <Sparkles size={16} strokeWidth={2.4} aria-hidden />
        <h2 id="ai-ideas-heading" className={cn(sectionTitle, "flex-1")}>
          AI habit ideas
        </h2>
      </div>
      <p className={cn(hint, "mb-3.5 mt-0 leading-[1.55]")}>
        Tell the coach what you want to build. Pick an idea to pre-fill the form.
      </p>

      <label className={field}>
        <span className={label}>Goal</span>
        <input
          className={input}
          placeholder="Sleep better, read more, move daily…"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
        />
      </label>
      <label className={field}>
        <span className={label}>Interests</span>
        <input
          className={input}
          placeholder="Fitness, learning, mindfulness…"
          value={interests}
          onChange={(event) => setInterests(event.target.value)}
        />
      </label>

      <button
        type="button"
        className={buttons("primary", "block", "mt-4")}
        disabled={ideasMutation.isPending}
        onClick={() => void generate()}
      >
        {ideasMutation.isPending ? (
          <>
            <LoaderCircle size={15} className="animate-payment-spin" aria-hidden />
            Generating…
          </>
        ) : (
          "Suggest habits"
        )}
      </button>

      {ideasMutation.isError ? (
        <p className={cn(hint, hintErr, "mt-3")}>
          {mutationErrorMessage(ideasMutation.error, "Could not generate ideas")}
        </p>
      ) : null}

      {ideas.length > 0 ? (
        <ul className="mt-4 grid list-none gap-3 p-0">
          {ideas.map((idea) => (
            <li
              key={idea.title}
              className="flex items-start justify-between gap-3 border-t border-ink/8 py-3 first:border-t-0 first:pt-0"
            >
              <div>
                <div className="font-bold tracking-[-0.01em]">
                  <span aria-hidden>{idea.icon}</span> {idea.title}
                </div>
                <p className={cn(hint, "mt-1")}>{idea.description}</p>
                <p className={cn(hint, mono)}>{idea.scheduleLabel}</p>
              </div>
              <button
                type="button"
                className={buttons("ghost", "sm")}
                onClick={() => onApply(prefillFromAiHabitIdea(idea))}
              >
                Use idea
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

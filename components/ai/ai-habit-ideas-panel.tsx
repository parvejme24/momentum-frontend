"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

import { AiUpgradePrompt } from "@/components/ai/ai-upgrade-prompt";
import { mutationErrorMessage } from "@/lib/admin/map";
import type { AiHabitIdea } from "@/lib/api/types";
import { useAiHabitIdeas, useAiStatus } from "@/lib/ai/hooks";
import { prefillFromAiHabitIdea, type AiHabitIdeaPrefill } from "@/lib/ai/map";

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
    <section className="card ai-panel" aria-labelledby="ai-ideas-heading">
      <div className="ai-panel-head">
        <Sparkles size={16} strokeWidth={2.4} aria-hidden />
        <h2 id="ai-ideas-heading" className="section-title">
          AI habit ideas
        </h2>
      </div>
      <p className="hint ai-panel-copy">
        Tell the coach what you want to build. Pick an idea to pre-fill the form.
      </p>

      <label className="field">
        <span className="label">Goal</span>
        <input
          className="input"
          placeholder="Sleep better, read more, move daily…"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
        />
      </label>
      <label className="field">
        <span className="label">Interests</span>
        <input
          className="input"
          placeholder="Fitness, learning, mindfulness…"
          value={interests}
          onChange={(event) => setInterests(event.target.value)}
        />
      </label>

      <button
        type="button"
        className="btn btn-primary btn-block"
        disabled={ideasMutation.isPending}
        onClick={() => void generate()}
      >
        {ideasMutation.isPending ? (
          <>
            <LoaderCircle size={15} className="ai-spin" aria-hidden />
            Generating…
          </>
        ) : (
          "Suggest habits"
        )}
      </button>

      {ideasMutation.isError ? (
        <p className="hint hint-err" style={{ marginTop: 12 }}>
          {mutationErrorMessage(ideasMutation.error, "Could not generate ideas")}
        </p>
      ) : null}

      {ideas.length > 0 ? (
        <ul className="ai-idea-list">
          {ideas.map((idea) => (
            <li key={idea.title} className="ai-idea-item">
              <div className="ai-idea-copy">
                <div className="ai-idea-title">
                  <span aria-hidden>{idea.icon}</span> {idea.title}
                </div>
                <p className="hint">{idea.description}</p>
                <p className="hint mono">{idea.scheduleLabel}</p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
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

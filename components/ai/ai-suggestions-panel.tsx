"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, RefreshCw, Sparkles } from "lucide-react";

import { AiUpgradePrompt } from "@/components/ai/ai-upgrade-prompt";
import { mutationErrorMessage } from "@/lib/admin/map";
import type { AiFocus, AiSuggestion } from "@/lib/api/types";
import { useAiStatus, useAiSuggestions } from "@/lib/ai/hooks";
import { suggestionAccent } from "@/lib/ai/map";

const FOCUS_TABS: { id: AiFocus; label: string }[] = [
  { id: "general", label: "General" },
  { id: "habits", label: "Habits" },
  { id: "streaks", label: "Streaks" },
  { id: "schedule", label: "Schedule" },
];

export function AiSuggestionsPanel() {
  const statusQuery = useAiStatus();
  const suggestions = useAiSuggestions();
  const [focus, setFocus] = useState<AiFocus>("general");
  const [items, setItems] = useState<AiSuggestion[]>([]);

  const enabled = statusQuery.data?.enabled ?? false;

  const load = useCallback(
    async (nextFocus: AiFocus) => {
      try {
        const result = await suggestions.mutateAsync({ focus: nextFocus });
        setItems(result.suggestions);
      } catch {
        setItems([]);
      }
    },
    [suggestions],
  );

  useEffect(() => {
    if (!enabled) return;
    void load(focus);
  }, [enabled, focus, load]);

  if (statusQuery.isLoading) return null;
  if (!enabled) return <AiUpgradePrompt compact />;

  return (
    <section className="card ai-panel" aria-labelledby="ai-suggestions-heading">
      <div className="ai-panel-head">
        <Sparkles size={16} strokeWidth={2.4} aria-hidden />
        <h2 id="ai-suggestions-heading" className="section-title">
          AI suggestions
        </h2>
        <button
          type="button"
          className="btn btn-ghost btn-sm ai-panel-refresh"
          disabled={suggestions.isPending}
          onClick={() => void load(focus)}
        >
          {suggestions.isPending ? (
            <LoaderCircle size={14} className="ai-spin" aria-hidden />
          ) : (
            <RefreshCw size={14} aria-hidden />
          )}
          Refresh
        </button>
      </div>

      <div className="tab-bar ai-focus-tabs" role="tablist" aria-label="Suggestion focus">
        {FOCUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={focus === tab.id}
            className={focus === tab.id ? "tab active" : "tab"}
            onClick={() => {
              setFocus(tab.id);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {suggestions.isError ? (
        <p className="hint hint-err">
          {mutationErrorMessage(suggestions.error, "Could not load suggestions")}
        </p>
      ) : null}

      {suggestions.isPending && items.length === 0 ? (
        <p className="hint ai-panel-loading">Thinking…</p>
      ) : items.length === 0 ? (
        <p className="hint">No suggestions yet.</p>
      ) : (
        <div className="insight-list">
          {items.map((item) => (
            <article
              key={`${item.title}-${item.category}`}
              className={`insight insight-${suggestionAccent(item.category)}`}
            >
              <h3 className="insight-title">{item.title}</h3>
              <p className="insight-body">{item.body}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

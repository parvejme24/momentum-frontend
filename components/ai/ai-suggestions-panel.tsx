"use client";

import { useState } from "react";
import { LoaderCircle, RefreshCw, Sparkles } from "lucide-react";

import { AiUpgradePrompt } from "@/components/ai/ai-upgrade-prompt";
import { mutationErrorMessage } from "@/lib/admin/map";
import type { AiFocus } from "@/lib/api/types";
import { useAiStatus, useAiSuggestions } from "@/lib/ai/hooks";
import { suggestionAccent } from "@/lib/ai/map";
import { buttons, card, hint, hintErr, sectionTitle, tabBar, tabs } from "@/lib/ui";
import { cn } from "@/lib/utils";

const FOCUS_TABS: { id: AiFocus; label: string }[] = [
  { id: "general", label: "General" },
  { id: "habits", label: "Habits" },
  { id: "streaks", label: "Streaks" },
  { id: "schedule", label: "Schedule" },
];

const insightAccentClass = {
  flame: "border-l-flame bg-flame-soft",
  blue: "border-l-blue bg-blue-soft",
  quiet:
    "border-l-ink bg-[color-mix(in_srgb,var(--rule)_55%,var(--paper-white))]",
} as const;

export function AiSuggestionsPanel() {
  const statusQuery = useAiStatus();
  const [focus, setFocus] = useState<AiFocus>("general");
  const enabled = statusQuery.data?.enabled ?? false;
  const suggestions = useAiSuggestions(focus, enabled && !statusQuery.isLoading);
  const items = suggestions.data?.suggestions ?? [];

  if (statusQuery.isLoading) return null;
  if (!enabled) return <AiUpgradePrompt compact />;

  return (
    <section className={cn(card, "mt-[18px]")} aria-labelledby="ai-suggestions-heading">
      <div className="mb-3 flex items-center gap-2.5">
        <Sparkles size={16} strokeWidth={2.4} aria-hidden />
        <h2 id="ai-suggestions-heading" className={cn(sectionTitle, "flex-1")}>
          AI suggestions
        </h2>
        <button
          type="button"
          className={buttons("ghost", "sm", "ml-auto inline-flex items-center gap-1.5")}
          disabled={suggestions.isFetching}
          onClick={() => void suggestions.refetch()}
        >
          {suggestions.isFetching ? (
            <LoaderCircle size={14} className="animate-payment-spin" aria-hidden />
          ) : (
            <RefreshCw size={14} aria-hidden />
          )}
          Refresh
        </button>
      </div>

      <div className={cn(tabBar, "mb-3.5")} role="tablist" aria-label="Suggestion focus">
        {FOCUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={focus === tab.id}
            className={tabs(focus === tab.id)}
            onClick={() => setFocus(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {suggestions.isError ? (
        <p className={cn(hint, hintErr)}>
          {mutationErrorMessage(suggestions.error, "Could not load suggestions")}
        </p>
      ) : null}

      {suggestions.isLoading && items.length === 0 ? (
        <p className={cn(hint, "mt-2")}>Thinking…</p>
      ) : items.length === 0 ? (
        <p className={hint}>No suggestions yet.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <article
              key={`${item.title}-${item.category}`}
              className={cn(
                "rounded-md border-[var(--stroke)] border-l-5 bg-paper-white px-4 py-3.5",
                insightAccentClass[suggestionAccent(item.category)],
              )}
            >
              <h3 className="m-0 font-heading text-[1.02rem] font-extrabold tracking-[-0.02em]">
                {item.title}
              </h3>
              <p className="mt-2 text-[0.88rem] leading-normal text-ink-70">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

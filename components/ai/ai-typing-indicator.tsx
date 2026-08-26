"use client";

import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const typingDot =
  "size-2 rounded-full bg-ink-50 animate-ai-dot motion-reduce:animate-none dark:bg-[color-mix(in_srgb,var(--ink)_50%,var(--blue))]";

const chatRow =
  "flex items-end gap-2 animate-ai-pop motion-reduce:animate-none";

const miniAvatar =
  "inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--ai-chat-edge-soft,var(--ink-12))] bg-flame-soft text-ink";

const bubble =
  "relative max-w-[min(88%,280px)] whitespace-pre-wrap break-words rounded-2xl border-[1.5px] border-[var(--ai-chat-edge-soft,var(--ink-12))] px-3.5 py-[11px] text-left text-[0.92rem] leading-[1.55] shadow-[2px_2px_0_var(--ai-chat-bubble-shadow,var(--ink))] dark:shadow-none";

const bubbleAssistant =
  "rounded-bl-[5px] bg-paper-white text-ink dark:border-rule dark:bg-paper-raised";

export function AiTypingIndicator() {
  return (
    <span
      className="inline-flex min-w-11 items-center justify-center gap-[5px] py-0.5"
      role="status"
      aria-live="polite"
      aria-label="Coach is typing"
    >
      <span className={typingDot} aria-hidden />
      <span className={cn(typingDot, "delay-200")} aria-hidden />
      <span className={cn(typingDot, "delay-400")} aria-hidden />
    </span>
  );
}

export function AiTypingRow() {
  return (
    <div className={cn(chatRow, "justify-start")}>
      <span className={miniAvatar} aria-hidden>
        <Sparkles size={11} strokeWidth={2.6} />
      </span>
      <div className={cn(bubble, bubbleAssistant, "min-w-14")}>
        <AiTypingIndicator />
      </div>
    </div>
  );
}

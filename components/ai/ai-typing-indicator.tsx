"use client";

import { Sparkles } from "lucide-react";

export function AiTypingIndicator() {
  return (
    <span
      className="ai-chat-typing"
      role="status"
      aria-live="polite"
      aria-label="Coach is typing"
    >
      <span className="ai-chat-typing-dot" aria-hidden />
      <span className="ai-chat-typing-dot" aria-hidden />
      <span className="ai-chat-typing-dot" aria-hidden />
    </span>
  );
}

export function AiTypingRow() {
  return (
    <div className="ai-chat-row ai-chat-row-assistant ai-chat-row-typing">
      <span className="ai-chat-mini-avatar" aria-hidden>
        <Sparkles size={11} strokeWidth={2.6} />
      </span>
      <div className="ai-chat-bubble ai-chat-bubble-assistant ai-chat-bubble-typing">
        <AiTypingIndicator />
      </div>
    </div>
  );
}

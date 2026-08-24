"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LoaderCircle, MessageCircle, Send, Sparkles, X } from "lucide-react";

import { AiChatHabitDraft } from "@/components/ai/ai-chat-habit-draft";
import { AiTypingRow } from "@/components/ai/ai-typing-indicator";
import { AiUpgradePrompt } from "@/components/ai/ai-upgrade-prompt";
import { useToast } from "@/components/auth/toast";
import { mutationErrorMessage } from "@/lib/admin/map";
import type { AiCreateHabitResponse } from "@/lib/api/types";
import { wantsCreateHabit } from "@/lib/ai/chat-intent";
import { useAiChat, useAiCreateHabit, useAiStatus } from "@/lib/ai/hooks";
import { toCreateHabitRequestFromAiDraft } from "@/lib/ai/map";
import { useCreateHabit } from "@/lib/habits/hooks";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  draft?: AiCreateHabitResponse;
  savedHabitId?: string;
};

function habitIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/habits\/([^/]+)/);
  if (!match) return undefined;
  const id = match[1];
  if (id === "new" || id === "archived") return undefined;
  return id;
}

function nextMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AiChatWidget() {
  const pathname = usePathname();
  const { pushToast } = useToast();
  const statusQuery = useAiStatus();
  const chat = useAiChat();
  const createDraft = useAiCreateHabit();
  const saveHabit = useCreateHabit();
  const panelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [savingDraftId, setSavingDraftId] = useState<string | null>(null);

  const habitId = habitIdFromPath(pathname);
  const enabled = statusQuery.data?.enabled ?? false;
  const ready = !statusQuery.isLoading;
  const isBusy = chat.isPending || createDraft.isPending || Boolean(savingDraftId);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || !threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [open, messages, isBusy]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send() {
    const message = input.trim();
    if (!message || isBusy || !enabled) return;

    setMessages((prev) => [
      ...prev,
      { id: nextMessageId(), role: "user", content: message },
    ]);
    setInput("");

    const shouldCreate = wantsCreateHabit(message, createMode);

    try {
      if (shouldCreate) {
        const result = await createDraft.mutateAsync({ message });
        setMessages((prev) => [
          ...prev,
          {
            id: nextMessageId(),
            role: "assistant",
            content: `Here's a draft for “${result.habit.title}”. Save it or customize first.`,
            draft: result,
          },
        ]);
        return;
      }

      const history = messages.slice(-18).map((item) => ({
        role: item.role,
        content: item.content,
      }));
      const result = await chat.mutateAsync({
        message,
        habitId,
        history,
      });
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId(), role: "assistant", content: result.reply },
      ]);
    } catch {
      setMessages((prev) => prev.slice(0, -1));
      setInput(message);
    }
  }

  async function saveDraft(messageId: string, draft: AiCreateHabitResponse) {
    setSavingDraftId(messageId);
    try {
      const habit = await saveHabit.mutateAsync(
        toCreateHabitRequestFromAiDraft(draft.habit, draft.reason),
      );
      setMessages((prev) =>
        prev.map((item) =>
          item.id === messageId
            ? { ...item, savedHabitId: habit.id }
            : item,
        ),
      );
      pushToast("Habit created 🎉");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not save habit"));
    } finally {
      setSavingDraftId(null);
    }
  }

  if (!ready) return null;

  const composerPlaceholder = createMode
    ? "Describe the habit you want…"
    : "Ask anything or describe a habit to create…";

  return (
    <div className="ai-chat-widget">
      {open ? (
        <div
          className="ai-chat-dock card"
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${panelId}-title`}
        >
          <div className="ai-chat-dock-head">
            <div className="ai-chat-dock-brand">
              <span className="ai-chat-dock-avatar" aria-hidden>
                <Sparkles size={15} strokeWidth={2.4} />
              </span>
              <div>
                <h2 id={`${panelId}-title`} className="section-title">
                  Coach
                </h2>
                <p
                  className={`ai-chat-dock-status mono${isBusy ? " is-typing" : ""}`}
                >
                  {isBusy
                    ? createMode || createDraft.isPending
                      ? "Drafting habit…"
                      : "Typing…"
                    : habitId
                      ? "Habit mode"
                      : "Online"}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-icon"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <X size={18} strokeWidth={2.4} aria-hidden />
            </button>
          </div>

          {!enabled ? (
            <AiUpgradePrompt compact />
          ) : (
            <>
              <div className="ai-chat-mode-bar" role="tablist" aria-label="Chat mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!createMode}
                  className={!createMode ? "ai-chat-mode active" : "ai-chat-mode"}
                  onClick={() => setCreateMode(false)}
                >
                  Chat
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={createMode}
                  className={createMode ? "ai-chat-mode active" : "ai-chat-mode"}
                  onClick={() => setCreateMode(true)}
                >
                  Create habit
                </button>
              </div>

              <div
                ref={threadRef}
                className="ai-chat-thread ai-chat-dock-thread"
                aria-live="polite"
              >
                {messages.length === 0 && !isBusy ? (
                  <div className="ai-chat-empty">
                    <p className="ai-chat-empty-title">
                      {createMode ? "Describe your habit" : "Ask anything"}
                    </p>
                    <p className="hint">
                      {createMode
                        ? "Type in your own words — we’ll draft the habit for you."
                        : "Chat for coaching, or switch to Create habit."}
                    </p>
                    <div className="ai-chat-prompts">
                      {(createMode
                        ? [
                            "Read 20 minutes every morning",
                            "Stop scrolling after 10pm",
                            "Stretch for 10 minutes on weekdays",
                          ]
                        : [
                            "What should I focus on today?",
                            "I want to meditate 10 minutes daily",
                            "Help me rebuild a broken streak",
                          ]
                      ).map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          className="ai-chat-prompt-chip"
                          onClick={() => {
                            setInput(prompt);
                            inputRef.current?.focus();
                          }}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((item) => (
                      <div
                        key={item.id}
                        className={
                          item.role === "user"
                            ? "ai-chat-row ai-chat-row-user"
                            : "ai-chat-row ai-chat-row-assistant"
                        }
                      >
                        {item.role === "assistant" ? (
                          <span className="ai-chat-mini-avatar" aria-hidden>
                            <Sparkles size={11} strokeWidth={2.6} />
                          </span>
                        ) : null}
                        <div className="ai-chat-message-stack">
                          {item.content ? (
                            <div
                              className={
                                item.role === "user"
                                  ? "ai-chat-bubble ai-chat-bubble-user"
                                  : "ai-chat-bubble ai-chat-bubble-assistant"
                              }
                            >
                              {item.content}
                            </div>
                          ) : null}
                          {item.draft ? (
                            <AiChatHabitDraft
                              draft={item.draft}
                              savedHabitId={item.savedHabitId}
                              saving={savingDraftId === item.id}
                              onSave={() => void saveDraft(item.id, item.draft!)}
                            />
                          ) : null}
                        </div>
                      </div>
                    ))}
                    {isBusy ? <AiTypingRow /> : null}
                  </>
                )}
              </div>

              {chat.isError || createDraft.isError ? (
                <p className="hint hint-err">
                  {mutationErrorMessage(
                    chat.error ?? createDraft.error,
                    createMode
                      ? "Could not draft habit"
                      : "Could not send message",
                  )}
                </p>
              ) : null}

              <div className="ai-chat-composer">
                <div
                  className={`ai-chat-composer-bar${input.trim() ? " has-text" : ""}${isBusy ? " is-sending" : ""}${createMode ? " is-create-mode" : ""}`}
                >
                  <input
                    ref={inputRef}
                    className="ai-chat-input"
                    value={input}
                    placeholder={composerPlaceholder}
                    disabled={isBusy}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void send();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="ai-chat-send"
                    disabled={isBusy || !input.trim()}
                    onClick={() => void send()}
                    aria-label={createMode ? "Draft habit" : "Send message"}
                  >
                    {isBusy ? (
                      <LoaderCircle size={16} className="ai-spin" aria-hidden />
                    ) : (
                      <Send size={16} strokeWidth={2.4} aria-hidden />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}

      <button
        type="button"
        className={`ai-chat-fab${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close AI chat" : "Open AI chat"}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="ai-chat-fab-pulse" aria-hidden />
        <span className="ai-chat-fab-face">
          {open ? (
            <X size={22} strokeWidth={2.4} aria-hidden />
          ) : (
            <MessageCircle size={22} strokeWidth={2.4} aria-hidden />
          )}
        </span>
        <span className="ai-chat-fab-tail" aria-hidden />
        {!open ? (
          <span className="ai-chat-fab-badge" aria-hidden>
            <Sparkles size={10} strokeWidth={2.8} />
          </span>
        ) : null}
      </button>
    </div>
  );
}

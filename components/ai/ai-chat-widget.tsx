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
import { buttons, card, hint, hintErr, mono, sectionTitle } from "@/lib/ui";
import { cn } from "@/lib/utils";

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

const widgetVars =
  "[--ai-chat-edge:var(--ink)] [--ai-chat-edge-soft:var(--ink-12)] [--ai-chat-bubble-shadow:var(--ink)] [--ai-chat-user-text:var(--paper-white)] [--ai-chat-user-bg:var(--blue)] [--ai-chat-user-edge:var(--blue-deep)] dark:[--ai-chat-edge:var(--rule-strong)] dark:[--ai-chat-edge-soft:color-mix(in_srgb,var(--ink)_18%,transparent)] dark:[--ai-chat-bubble-shadow:transparent] dark:[--ai-chat-user-text:var(--ink)] dark:[--ai-chat-user-bg:color-mix(in_srgb,var(--blue)_42%,var(--paper-raised))] dark:[--ai-chat-user-edge:color-mix(in_srgb,var(--blue)_35%,var(--rule))]";

const chatRow = "flex items-end gap-2 animate-ai-pop motion-reduce:animate-none";

const miniAvatar =
  "inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--ai-chat-edge-soft)] bg-flame-soft text-ink";

const bubble =
  "relative max-w-[min(88%,280px)] whitespace-pre-wrap break-words rounded-2xl border-[1.5px] border-[var(--ai-chat-edge-soft)] px-3.5 py-[11px] text-left text-[0.92rem] leading-[1.55] shadow-[2px_2px_0_var(--ai-chat-bubble-shadow)] dark:shadow-none";

const modeBtn =
  "cursor-pointer appearance-none rounded-full border border-ink/10 bg-transparent px-2.5 py-[7px] [font:inherit] text-[0.78rem] font-bold text-ink-70 transition-[border-color,background-color,color] duration-fast ease-smooth dark:border-rule dark:text-ink-50";

const modeBtnActive =
  "border-blue bg-blue-soft text-ink dark:border-[color-mix(in_srgb,var(--blue)_50%,var(--rule))] dark:bg-[color-mix(in_srgb,var(--blue)_25%,var(--paper-raised))] dark:text-ink";

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
  const hasText = Boolean(input.trim());

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
    : "Ask in Bangla, English, or Banglish — habits only.";

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-5 bottom-6 z-60 flex flex-col items-end gap-3.5",
        "max-nav:bottom-[calc(76px+env(safe-area-inset-bottom))]",
        widgetVars,
      )}
    >
      {open ? (
        <div
          className={cn(
            card,
            "pointer-events-auto m-0 flex max-h-[min(540px,calc(100vh-140px))] w-[min(370px,calc(100vw-32px))] flex-col overflow-hidden p-0 shadow-lift animate-ai-dock motion-reduce:animate-none",
            "max-nav:max-h-[min(460px,calc(100vh-180px))]",
            "dark:border-rule dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
          )}
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${panelId}-title`}
        >
          <div className="flex items-center justify-between gap-2.5 border-b border-ink/8 bg-[linear-gradient(120deg,color-mix(in_srgb,var(--flame-soft)_70%,var(--paper-white)),var(--paper-white)_60%)] px-3.5 pt-3.5 pb-3 dark:border-rule dark:bg-[linear-gradient(120deg,color-mix(in_srgb,var(--flame-soft)_85%,var(--paper-raised)),var(--paper-raised)_65%)]">
            <div className="flex items-center gap-2.5">
              <span
                className="inline-flex size-[34px] items-center justify-center rounded-[12px] border-[1.5px] border-[var(--ai-chat-edge-soft)] bg-flame text-paper-white shadow-paper-sm"
                aria-hidden
              >
                <Sparkles size={15} strokeWidth={2.4} />
              </span>
              <div>
                <h2 id={`${panelId}-title`} className={cn(sectionTitle, "text-base")}>
                  Coach
                </h2>
                <p className={cn(mono, "mt-0.5 text-[0.7rem] text-ink-50")}>
                  <span
                    className={cn(
                      "mr-1.5 inline-block size-1.5 translate-y-px rounded-full",
                      isBusy
                        ? "bg-flame animate-ai-dot motion-reduce:animate-none"
                        : "bg-[#2f9e6b]",
                    )}
                    aria-hidden
                  />
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
              className={buttons("icon")}
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <X size={18} strokeWidth={2.4} aria-hidden />
            </button>
          </div>

          {!enabled ? (
            <AiUpgradePrompt compact embedded />
          ) : (
            <>
              <div
                className="grid grid-cols-2 gap-2 border-b border-ink/8 bg-paper-raised px-3.5 pb-2.5 dark:border-rule"
                role="tablist"
                aria-label="Chat mode"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={!createMode}
                  className={cn(modeBtn, !createMode && modeBtnActive)}
                  onClick={() => setCreateMode(false)}
                >
                  Chat
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={createMode}
                  className={cn(modeBtn, createMode && modeBtnActive)}
                  onClick={() => setCreateMode(true)}
                >
                  Create habit
                </button>
              </div>

              <div
                ref={threadRef}
                className="mb-0 grid min-h-40 flex-1 gap-3 overflow-auto bg-[radial-gradient(circle_at_12%_8%,color-mix(in_srgb,var(--flame-soft)_45%,transparent),transparent_42%),radial-gradient(circle_at_88%_18%,color-mix(in_srgb,var(--blue-soft)_50%,transparent),transparent_40%),var(--paper)] p-3.5"
                aria-live="polite"
              >
                {messages.length === 0 && !isBusy ? (
                  <div className="px-1 pt-2 pb-1">
                    <p className="m-0 mb-1 font-heading text-[1.05rem] font-bold tracking-[-0.02em]">
                      {createMode ? "Describe your habit" : "Ask anything"}
                    </p>
                    <p className={hint}>
                      {createMode
                        ? "Type in your own words — we’ll draft the habit for you."
                        : "Chat for coaching, or switch to Create habit."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
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
                          className="cursor-pointer appearance-none rounded-full border border-ink/10 bg-paper-raised px-[11px] py-[7px] text-left [font:inherit] text-[0.78rem] font-semibold leading-[1.3] text-ink transition-[border-color,transform] duration-fast ease-smooth hover:-translate-y-px hover:border-[var(--ai-chat-edge-soft)] dark:border-rule dark:bg-paper-raised dark:hover:border-[color-mix(in_srgb,var(--blue)_40%,var(--rule))]"
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
                        className={cn(
                          chatRow,
                          item.role === "user" ? "justify-end" : "justify-start",
                        )}
                      >
                        {item.role === "assistant" ? (
                          <span className={miniAvatar} aria-hidden>
                            <Sparkles size={11} strokeWidth={2.6} />
                          </span>
                        ) : null}
                        <div
                          className={cn(
                            "grid max-w-[min(92%,300px)] gap-2.5",
                            item.role === "user" && "justify-items-end",
                          )}
                        >
                          {item.content ? (
                            <div
                              className={cn(
                                bubble,
                                item.role === "user"
                                  ? "justify-self-end rounded-br-[5px] border-[var(--ai-chat-user-edge)] bg-[var(--ai-chat-user-bg)] text-[var(--ai-chat-user-text)]"
                                  : "justify-self-start rounded-bl-[5px] bg-paper-white text-ink dark:border-rule dark:bg-paper-raised",
                              )}
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
                <p className={cn(hint, hintErr, "mx-3.5 mb-2 mt-0")}>
                  {mutationErrorMessage(
                    chat.error ?? createDraft.error,
                    createMode
                      ? "Could not draft habit"
                      : "Could not send message",
                  )}
                </p>
              ) : null}

              <div className="border-t border-ink/8 bg-paper-raised px-3.5 pt-3 pb-3.5">
                <div
                  className={cn(
                    "flex w-full items-center gap-2 rounded-full border-2 border-[var(--ai-chat-edge-soft)] bg-paper py-[5px] pr-[5px] pl-3.5 shadow-paper-sm transition-[border-color,box-shadow,transform] duration-fast ease-smooth",
                    "focus-within:border-blue focus-within:shadow-[var(--focus-ring)] focus-within:-translate-y-px",
                    "dark:border-rule dark:bg-paper-raised dark:shadow-none dark:focus-within:translate-y-0 dark:focus-within:border-[color-mix(in_srgb,var(--blue)_55%,var(--rule))] dark:focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--blue)_22%,transparent)]",
                    hasText &&
                      "border-[color-mix(in_srgb,var(--blue)_35%,var(--ai-chat-edge-soft))] dark:border-[color-mix(in_srgb,var(--blue)_40%,var(--rule))]",
                    isBusy &&
                      "border-[color-mix(in_srgb,var(--flame)_40%,var(--ai-chat-edge-soft))]",
                    createMode &&
                      "border-[color-mix(in_srgb,var(--flame)_35%,var(--ai-chat-edge-soft))] focus-within:border-flame focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--flame)_18%,transparent)]",
                  )}
                >
                  <input
                    ref={inputRef}
                    className="min-w-0 flex-1 border-0 bg-transparent py-[9px] [font:inherit] text-[0.92rem] text-inherit placeholder:text-ink-50 focus:shadow-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-65"
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
                    className={cn(
                      "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink/12 bg-blue p-0 text-paper-white shadow-paper-sm transition-[transform,background-color,border-color,box-shadow,opacity] duration-fast ease-smooth",
                      "hover:enabled:-translate-y-px hover:enabled:scale-[1.04] hover:enabled:bg-blue-deep",
                      "active:enabled:translate-y-px active:enabled:scale-[0.98] active:enabled:shadow-press",
                      "disabled:cursor-not-allowed disabled:opacity-[0.38] disabled:shadow-none",
                      "dark:border-rule-strong dark:bg-[color-mix(in_srgb,var(--blue)_75%,var(--paper-raised))] dark:text-ink dark:shadow-none dark:hover:enabled:bg-[color-mix(in_srgb,var(--blue)_90%,var(--paper-white))]",
                      hasText &&
                        !isBusy &&
                        "animate-ai-send motion-reduce:animate-none dark:animate-none",
                      isBusy && "border-ink bg-flame animate-none",
                    )}
                    disabled={isBusy || !input.trim()}
                    onClick={() => void send()}
                    aria-label={createMode ? "Draft habit" : "Send message"}
                  >
                    {isBusy ? (
                      <LoaderCircle
                        size={16}
                        className="animate-payment-spin"
                        aria-hidden
                      />
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
        className="group pointer-events-auto relative size-[60px] cursor-pointer border-0 bg-transparent p-0 text-paper-white focus-visible:outline-none"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close AI chat" : "Open AI chat"}
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-0.5 z-0 rounded-[24px] border-2 border-flame/55 animate-ai-pulse motion-reduce:animate-none",
            open && "pointer-events-none opacity-0",
          )}
          aria-hidden
        />
        <span
          className={cn(
            "relative z-[2] inline-flex size-14 items-center justify-center border-2 border-[var(--ai-chat-edge)] text-paper-white shadow-paper-sm",
            "rounded-[22px_22px_8px_22px] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--flame)_88%,#ff8a6a)_0%,var(--flame)_55%,color-mix(in_srgb,var(--flame)_70%,var(--ink))_100%)]",
            "transition-[transform,background,border-radius] duration-normal ease-smooth",
            "group-hover:-translate-y-[3px] group-hover:-rotate-3",
            "group-focus-visible:outline-3 group-focus-visible:outline-solid group-focus-visible:outline-offset-[3px] group-focus-visible:outline-blue",
            "dark:border-[color-mix(in_srgb,var(--flame)_45%,var(--rule))] dark:text-ink dark:bg-[linear-gradient(145deg,color-mix(in_srgb,var(--flame)_75%,var(--paper-raised))_0%,color-mix(in_srgb,var(--flame)_55%,var(--paper))_100%)]",
            open &&
              "rounded-full border-[var(--ai-chat-edge-soft)] bg-paper-raised text-ink translate-y-0 rotate-0 group-hover:translate-y-0 group-hover:rotate-0",
          )}
        >
          {open ? (
            <X size={22} strokeWidth={2.4} aria-hidden />
          ) : (
            <MessageCircle size={22} strokeWidth={2.4} aria-hidden />
          )}
        </span>
        <span
          className={cn(
            "absolute right-1.5 bottom-0.5 z-[1] size-3.5 origin-center rotate-[28deg] skew-x-[-12deg] border-r-2 border-b-2 border-[var(--ai-chat-edge)] bg-flame transition-[opacity,background-color] duration-fast ease-smooth",
            "dark:border-[color-mix(in_srgb,var(--flame)_45%,var(--rule))] dark:bg-[color-mix(in_srgb,var(--flame)_70%,var(--paper-raised))]",
            open && "pointer-events-none opacity-0",
          )}
          aria-hidden
        />
        {!open ? (
          <span
            className="absolute -top-0.5 -right-0.5 z-[3] inline-flex size-[22px] items-center justify-center rounded-full border-[1.5px] border-[var(--ai-chat-edge-soft)] bg-paper-white text-flame shadow-paper-sm dark:border-rule dark:bg-paper-raised"
            aria-hidden
          >
            <Sparkles size={10} strokeWidth={2.8} />
          </span>
        ) : null}
      </button>
    </div>
  );
}

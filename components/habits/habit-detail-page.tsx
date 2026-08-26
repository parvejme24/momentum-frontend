"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, CalendarDays, Pencil } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { useToast } from "@/components/auth/toast";
import {
  statusLabel,
  WEEKDAY_LABELS,
  type HabitDetail,
  type HabitReminder,
  type RecentDay,
} from "@/components/habits/habit-detail-data";
import { YearChain } from "@/components/habits/year-chain";
import { AiHabitCoach } from "@/components/ai/ai-habit-coach";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import {
  HABIT_BODY,
  HABIT_DONE,
  HABIT_GLYPH,
  HABIT_META,
  HABIT_ROW,
  HABIT_TITLE,
  MARK,
  MARK_DONE,
  MARK_IDLE,
  MARK_SVG,
} from "@/components/today/habit-row";
import { ConfirmSheet } from "@/components/settings/confirm-sheet";
import { TimePicker } from "@/components/ui/time-picker";
import { RateBars } from "@/components/stats/rate-bars";
import { Switch } from "@/components/ui/switch";
import { HabitDetailSkeleton } from "@/components/ui/page-skeletons";
import { ApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/context";
import { addDaysIso, asPercent, formatPrettyIso, isoDateInTimeZone } from "@/lib/dates";
import {
  useArchiveHabit,
  useHabit,
  useRestoreHabit,
} from "@/lib/habits/hooks";
import { toHabitDetail } from "@/lib/habits/map";
import { useHabitLogs } from "@/lib/logs/hooks";
import {
  useCreateReminder,
  useHabitReminders,
  useUpdateReminder,
} from "@/lib/reminders/hooks";
import { useHabitStats } from "@/lib/stats/hooks";
import {
  habitStatsWeekdayRates,
  isLogMarked,
  lastWeekRates,
  toRecentDays,
  toUiReminder,
  weekdayInsight,
} from "@/lib/stats/map";
import { useDeleteLog, useUpsertLog } from "@/lib/today/hooks";
import {
  backLink,
  btn,
  btnDanger,
  btnGhost,
  btnPrimary,
  btnSm,
  card,
  cardHover,
  chip,
  chipBlue,
  chipQuiet,
  field,
  hint,
  label,
  lede,
  mono,
  pageHead,
  panelHead,
  sectionTitle,
  settingsActions,
  stat,
  statK,
  statN,
  statV,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

function formatTotal(n: number) {
  return n.toLocaleString("en-US");
}

function CheckIcon({ done }: { done?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn(MARK_SVG, done && "[stroke-dashoffset:0]")}
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function weekLabels(count: number) {
  return Array.from({ length: count }, (_, i) => {
    if (i === 0) return "12w";
    if (i === count - 1) return "Now";
    return "";
  });
}

const HEAT_SWATCH =
  "block size-3 rounded-[2px] border border-[rgba(20,26,46,0.07)]";

function TodayMarkRow({
  detail,
  done,
  onToggle,
  todayLabel,
}: {
  detail: HabitDetail;
  done: boolean;
  onToggle: () => void;
  todayLabel: string;
}) {
  const [stamping, setStamping] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function handleMark() {
    setStamping(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStamping(false), 340);
    onToggle();
  }

  const quantity =
    detail.todayQuantity != null
      ? `${detail.todayQuantity.current} of ${detail.todayQuantity.target} ${detail.unit}`
      : null;

  return (
    <article className={cn(HABIT_ROW, done && HABIT_DONE)}>
      <div
        className={cn(HABIT_GLYPH, done && "opacity-55")}
        style={{ background: detail.tint }}
        aria-hidden
      >
        {detail.emoji}
      </div>
      <div className={HABIT_BODY}>
        <div className={cn(HABIT_TITLE, done && "text-ink-50")}>Marked for today</div>
        <div className={HABIT_META}>
          {quantity ? <span className={mono}>{quantity}</span> : null}
          <span>{todayLabel}</span>
        </div>
      </div>
      <button
        type="button"
        className={cn(
          MARK,
          "size-[52px]",
          done ? MARK_DONE : MARK_IDLE,
          stamping && "animate-stamp motion-reduce:animate-none",
        )}
        aria-pressed={done}
        aria-label={
          done
            ? `Clear ${detail.title} for today`
            : `Mark ${detail.title} for today`
        }
        onClick={handleMark}
      >
        <CheckIcon done={done} />
      </button>
    </article>
  );
}

function ReminderRow({
  reminder,
  quiet,
  onToggle,
}: {
  reminder: HabitReminder;
  quiet: boolean;
  onToggle: (id: string, enabled: boolean) => void;
}) {
  const paused = reminder.paused || !reminder.enabled;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3.5 rounded-md border border-ink/9 bg-paper-white px-4 py-3.5",
        (paused || quiet) && "border-ink-30 opacity-[0.72]",
      )}
    >
      <div>
        <div
          className={cn(
            mono,
            "text-[1.02rem] font-bold tracking-[-0.03em]",
            paused && "text-ink-50",
          )}
        >
          {reminder.time}
        </div>
        <div className="mt-[3px] text-[0.78rem] text-ink-50">
          {reminder.schedule}
          {reminder.timezone ? ` · ${reminder.timezone}` : null}
          {paused ? " · paused" : null}
        </div>
      </div>
      <Switch
        checked={reminder.enabled}
        onCheckedChange={(checked) => onToggle(reminder.id, checked)}
        aria-label={`Reminder at ${reminder.time}`}
      />
    </div>
  );
}

function RecentDayRow({ day }: { day: RecentDay }) {
  return (
    <li className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] items-center gap-3 border-b border-ink/8 py-3 first:pt-0 last:border-b-0 last:pb-0 max-nav:grid-cols-[1fr_auto] max-nav:gap-x-3 max-nav:gap-y-2">
      <span className={cn(mono, "text-[0.82rem] font-semibold text-ink-70")}>
        {day.label}
      </span>
      <span className={cn(mono, "text-[0.82rem] font-semibold text-ink max-nav:col-start-1")}>
        {day.quantity ?? "—"}
      </span>
      <span
        className={cn(
          chip,
          day.status === "done" ? chipBlue : chipQuiet,
          "max-nav:col-start-2 max-nav:row-span-2 max-nav:self-center",
        )}
      >
        {statusLabel(day.status)}
      </span>
    </li>
  );
}

export function HabitDetailPage({ habitId }: { habitId: string }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const todayIso = isoDateInTimeZone(user?.timezone);
  const habitQuery = useHabit(habitId);
  const statsQuery = useHabitStats(habitId, "365d");
  const remindersQuery = useHabitReminders(habitId);
  const logsQuery = useHabitLogs(habitId, {
    from: addDaysIso(todayIso, -29),
    to: todayIso,
  });
  const archive = useArchiveHabit();
  const restore = useRestoreHabit();
  const upsertLog = useUpsertLog();
  const removeLog = useDeleteLog();
  const createReminder = useCreateReminder(habitId);
  const patchReminder = useUpdateReminder();

  const base = useMemo(
    () => (habitQuery.data ? toHabitDetail(habitQuery.data) : null),
    [habitQuery.data],
  );
  const stats = statsQuery.data;
  const reminders = useMemo(
    () =>
      (remindersQuery.data ?? []).map((reminder) =>
        toUiReminder(reminder, user?.timezone),
      ),
    [remindersQuery.data, user?.timezone],
  );
  const recentDays = useMemo(
    () => toRecentDays(logsQuery.data ?? [], todayIso),
    [logsQuery.data, todayIso],
  );
  const todayLog = (logsQuery.data ?? []).find((log) => log.localDate === todayIso);
  const marked = isLogMarked(todayLog?.status);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addTime, setAddTime] = useState("20:00");
  const [savingLog, setSavingLog] = useState(false);
  const todayLabel = useMemo(
    () =>
      formatPrettyIso(todayIso, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [todayIso],
  );

  const weekRates = lastWeekRates(stats?.byWeek ?? []);
  const weekdayRates = stats ? habitStatsWeekdayRates(stats) : [];
  const insight = stats ? weekdayInsight(stats.byWeekday) : base?.weekdayInsight;

  const coachContext =
    marked && base && base.currentStreak >= 7
      ? "celebration"
      : marked
        ? "check_in"
        : base && base.currentStreak > 0
          ? "streak"
          : base && base.currentStreak === 0
            ? "missed"
            : "general";

  if (habitQuery.isLoading) {
    return <HabitDetailSkeleton />;
  }

  if (!base) {
    return (
      <div className={pageHead}>
        <Link href="/habits" className={cn(backLink, mono)}>
          ← All habits
        </Link>
        <h1>Habit not found</h1>
        <p className={cn(lede, "mt-3")}>
          {habitQuery.error instanceof ApiError
            ? habitQuery.error.message
            : "This habit isn’t in your library."}
        </p>
        <p className="mt-6">
          <Link href="/habits" className={cn(btn, btnPrimary)}>
            Back to habits
          </Link>
        </p>
      </div>
    );
  }

  async function toggleMark() {
    setSavingLog(true);
    try {
      if (marked) {
        await removeLog.mutateAsync({ habitId, localDate: todayIso });
        pushToast(`Cleared ${base!.title}`);
      } else {
        await upsertLog.mutateAsync({
          habitId,
          localDate: todayIso,
          body: {
            status: "DONE",
            ...(habitQuery.data?.targetValue != null
              ? { value: habitQuery.data.targetValue }
              : {}),
          },
        });
        pushToast(`Marked ${base!.title} for today`);
      }
    } catch (error) {
      pushToast(error instanceof ApiError ? error.message : "Could not update log");
    } finally {
      setSavingLog(false);
    }
  }

  async function toggleReminder(id: string, enabled: boolean) {
    try {
      const result = await patchReminder.mutateAsync({
        reminderId: id,
        body: { enabled },
      });
      pushToast(enabled ? "Reminder on" : "Reminder paused");
      if (result.warnings[0]) pushToast(result.warnings[0]);
    } catch (error) {
      pushToast(
        error instanceof ApiError ? error.message : "Could not update reminder",
      );
    }
  }

  async function confirmAddReminder() {
    try {
      const result = await createReminder.mutateAsync({
        timeLocal: addTime,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        enabled: true,
      });
      setAddOpen(false);
      pushToast("Reminder added");
      if (result.warnings[0]) pushToast(result.warnings[0]);
    } catch (error) {
      pushToast(
        error instanceof ApiError ? error.message : "Could not add reminder",
      );
    }
  }

  async function confirmArchive() {
    setArchiving(true);
    try {
      if (base!.archived) {
        await restore.mutateAsync(habitId);
        setArchiveOpen(false);
        pushToast(`Restored ${base!.title}`);
        router.push("/habits");
        return;
      }
      await archive.mutateAsync(habitId);
      setArchiveOpen(false);
      pushToast(`Archived ${base!.title}`);
      router.push("/habits/archived");
    } catch (error) {
      pushToast(
        error instanceof ApiError ? error.message : "Could not update habit",
      );
    } finally {
      setArchiving(false);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="min-w-0"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <motion.header
          className="mb-[22px]"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <Link href="/habits" className={cn(backLink, mono, "mb-3.5")}>
            ← All habits
          </Link>

          <div className="flex flex-wrap items-start gap-4 max-nav:flex-col">
            <div
              className="grid size-16 shrink-0 place-items-center rounded-lg border border-ink/9 text-[1.7rem] shadow-paper-sm"
              style={{ background: base.tint }}
              aria-hidden
            >
              {base.emoji}
            </div>

            <div className="min-w-[min(100%,220px)] flex-1">
              <h1 className="m-0 font-heading text-[clamp(1.7rem,4vw,2.35rem)] leading-[1.05] font-extrabold tracking-[-0.035em]">
                {base.title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={cn(chip, chipBlue)}>{base.schedule}</span>
                {base.quantityLabel ? (
                  <span className={cn(chip, chipQuiet)}>{base.quantityLabel}</span>
                ) : null}
                {reminders[0] ? (
                  <span className={cn(chip, chipQuiet)}>{reminders[0].time}</span>
                ) : null}
              </div>
            </div>

            <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 max-wide:ml-0 max-nav:w-full">
              <Link href="/dashboard" className={cn(btn, btnPrimary, btnSm, "inline-flex items-center gap-1.5")}>
                <CalendarDays size={14} strokeWidth={2.2} aria-hidden />
                Open in Today
              </Link>
              <Link
                href={`/habits/${habitId}/edit`}
                className={cn(btn, btnGhost, btnSm, "inline-flex items-center gap-1.5")}
              >
                <Pencil size={14} strokeWidth={2.2} aria-hidden />
                Edit
              </Link>
              <button
                type="button"
                className={cn(
                  btn,
                  btnGhost,
                  btnSm,
                  "inline-flex items-center gap-1.5 text-ink-70 hover:border-[color-mix(in_srgb,var(--flame)_45%,transparent)] hover:bg-flame-soft hover:text-danger-ink",
                )}
                onClick={() => setArchiveOpen(true)}
              >
                <Archive size={14} strokeWidth={2.2} aria-hidden />
                {base.archived ? "Restore" : "Archive"}
              </button>
            </div>
          </div>
        </motion.header>

        <motion.div variants={reduce ? undefined : fadeUpSoft}>
          <AiHabitCoach habitId={habitId} context={coachContext} />
        </motion.div>

        <motion.section
          className="mb-[22px]"
          aria-label="Today’s mark"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <TodayMarkRow
            detail={{
              ...base,
              todayQuantity:
                habitQuery.data?.targetValue != null
                  ? {
                      current:
                        todayLog?.value ??
                        (marked ? habitQuery.data.targetValue : 0),
                      target: habitQuery.data.targetValue,
                    }
                  : undefined,
            }}
            done={marked}
            onToggle={() => {
              if (savingLog) return;
              void toggleMark();
            }}
            todayLabel={todayLabel}
          />
        </motion.section>

        <motion.section
          className="mb-[22px] grid grid-cols-2 gap-6 wide:grid-cols-4"
          aria-label="Habit stats"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <article className={cn(stat, cardHover)}>
            <div className={statK}>Current streak</div>
            <div className={cn(statV, "text-flame")}>
              {stats?.streak.current ?? base.currentStreak}
            </div>
            <div className={statN}>days without a break</div>
          </article>
          <article className={cn(stat, cardHover)}>
            <div className={statK}>Longest streak</div>
            <div className={statV}>{stats?.streak.longest ?? base.longestStreak}</div>
            <div className={statN}>
              {stats
                ? `${formatPrettyIso(stats.range.from, { day: "numeric", month: "short" })} → ${formatPrettyIso(stats.range.to, { day: "numeric", month: "short" })}`
                : base.longestRange}
            </div>
          </article>
          <article className={cn(stat, cardHover)}>
            <div className={statK}>Completion</div>
            <div className={statV}>
              {stats ? asPercent(stats.completion.rate) : base.completionRate}%
            </div>
            <div className={statN}>
              {stats && stats.completion.due > 0
                ? `${stats.completion.done} of ${stats.completion.due} days`
                : "As you log days"}
            </div>
          </article>
          <article className={cn(stat, cardHover)}>
            <div className={statK}>Total logged</div>
            <div className={statV}>
              {formatTotal(stats?.totalValue ?? stats?.completion.done ?? 0)}
            </div>
            <div className={statN}>{base.totalLoggedUnit}</div>
          </article>
        </motion.section>

        <motion.section
          className={cn(card, "mb-[22px]")}
          aria-labelledby="chain-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className={cn(panelHead, "items-end gap-3.5 max-nav:flex-col max-nav:items-start")}>
            <div>
              <h2 id="chain-heading" className={sectionTitle}>
                The chain
              </h2>
              <p className={cn(hint, "mt-1")}>
                Last 364 days · hover a square for the date
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 font-mono text-[0.68rem] text-ink-50"
              aria-hidden
            >
              <span>Less</span>
              <i className={cn(HEAT_SWATCH, "bg-l0")} />
              <i className={cn(HEAT_SWATCH, "bg-l1")} />
              <i className={cn(HEAT_SWATCH, "bg-l2")} />
              <i className={cn(HEAT_SWATCH, "bg-l3")} />
              <i className={cn(HEAT_SWATCH, "bg-l4")} />
              <span>More</span>
            </div>
          </div>

          <YearChain
            heatmap={stats?.heatmap ?? []}
            activeWeekdays={base.activeWeekdays}
            label={base.title}
          />
        </motion.section>

        <motion.section
          className="mt-[22px] grid grid-cols-1 gap-6 nav:grid-cols-2"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <article className={card}>
            <div className={panelHead}>
              <div>
                <h2 className={sectionTitle}>Last 12 weeks</h2>
                <p className={cn(hint, "mt-1")}>Weekly completion</p>
              </div>
            </div>
            {weekRates.length > 0 ? (
              <RateBars
                rates={weekRates}
                labels={weekLabels(weekRates.length)}
                ariaLabel="Last 12 weeks completion"
              />
            ) : (
              <p className={hint}>Weekly completion appears after you log days.</p>
            )}
          </article>

          <article className={card}>
            <div className={panelHead}>
              <div>
                <h2 className={sectionTitle}>By weekday</h2>
                <p className={cn(hint, "mt-1")}>Where the plan keeps failing</p>
              </div>
            </div>
            {weekdayRates.some((rate) => rate > 0) ? (
              <>
                <RateBars
                  rates={weekdayRates}
                  labels={WEEKDAY_LABELS}
                  ariaLabel="Completion by weekday"
                  hotThreshold={0.82}
                />
                <p className="mt-4 border-t border-ink/8 pt-3.5 text-[0.9rem] leading-[1.55] text-ink-70">
                  {insight}
                </p>
              </>
            ) : (
              <p className={hint}>{insight}</p>
            )}
          </article>
        </motion.section>

        <motion.section
          className="mt-[22px] grid grid-cols-1 gap-6 nav:grid-cols-2"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <article className={card}>
            <div className={panelHead}>
              <h2 className={sectionTitle}>Reminders</h2>
              <button
                type="button"
                className={cn(btn, btnSm, btnGhost)}
                onClick={() => setAddOpen(true)}
              >
                + Add
              </button>
            </div>
            <div className="grid gap-2.5">
              {reminders.length === 0 ? (
                <p className={hint}>No reminders set for this habit.</p>
              ) : (
                reminders.map((reminder) => (
                  <ReminderRow
                    key={reminder.id}
                    reminder={reminder}
                    quiet={marked}
                    onToggle={(id, enabled) => void toggleReminder(id, enabled)}
                  />
                ))
              )}
            </div>
            {marked ? (
              <p className={cn(hint, "mt-3")}>
                Today is already marked — reminders stay quiet.
              </p>
            ) : null}
          </article>

          <article className={card}>
            <div className={panelHead}>
              <h2 className={sectionTitle}>Recent days</h2>
            </div>
            {recentDays.length === 0 ? (
              <p className={hint}>No logs yet for this habit.</p>
            ) : (
              <ul className="m-0 grid list-none p-0">
                {recentDays.map((day) => (
                  <RecentDayRow key={day.id} day={day} />
                ))}
              </ul>
            )}
          </article>
        </motion.section>

        <ConfirmSheet
          open={archiveOpen}
          onClose={() => setArchiveOpen(false)}
          title={base.archived ? "Restore this habit?" : "Archive this habit?"}
        >
          <p className={cn(hint, "mt-2.5 leading-[1.55]")}>
            {base.archived
              ? "It comes back to Today and Habits. History stays on file."
              : "It leaves the daily list right away. History stays on file — restore from Habits anytime."}
          </p>
          <div className={cn(settingsActions, "mt-[22px]")}>
            <button
              type="button"
              className={cn(btn, btnGhost)}
              onClick={() => setArchiveOpen(false)}
              disabled={archiving}
            >
              {base.archived ? "Keep archived" : "Keep it active"}
            </button>
            <button
              type="button"
              className={cn(btn, btnDanger)}
              onClick={() => void confirmArchive()}
              disabled={archiving}
            >
              {archiving
                ? base.archived
                  ? "Restoring…"
                  : "Archiving…"
                : base.archived
                  ? "Restore habit"
                  : "Archive habit"}
            </button>
          </div>
        </ConfirmSheet>

        <ConfirmSheet
          open={addOpen}
          onClose={() => setAddOpen(false)}
          title="Add a reminder"
        >
          <div className={cn(field, "mt-3.5")}>
            <span className={label}>Time</span>
            <TimePicker
              id="reminder-time"
              value={addTime}
              onChange={setAddTime}
              placeholder="Pick a time"
            />
            <span className={hint}>Sent in {user?.timezone || "your timezone"}.</span>
          </div>
          <div className={cn(settingsActions, "mt-[22px]")}>
            <button
              type="button"
              className={cn(btn, btnGhost)}
              onClick={() => setAddOpen(false)}
              disabled={createReminder.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className={cn(btn, btnPrimary)}
              onClick={() => void confirmAddReminder()}
              disabled={createReminder.isPending}
            >
              {createReminder.isPending ? "Adding…" : "Add reminder"}
            </button>
          </div>
        </ConfirmSheet>
      </motion.div>
    </MotionConfig>
  );
}

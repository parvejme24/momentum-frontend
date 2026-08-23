"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Pencil } from "lucide-react";
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
import { ConfirmSheet } from "@/components/settings/confirm-sheet";
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

function formatTotal(n: number) {
  return n.toLocaleString("en-US");
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
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
    <article className={done ? "habit done habit-detail-mark" : "habit habit-detail-mark"}>
      <div
        className="habit-glyph"
        style={{ background: detail.tint }}
        aria-hidden
      >
        {detail.emoji}
      </div>
      <div className="habit-body">
        <div className="habit-title">Marked for today</div>
        <div className="habit-meta">
          {quantity ? <span className="mono">{quantity}</span> : null}
          <span>{todayLabel}</span>
        </div>
      </div>
      <button
        type="button"
        className={stamping ? "mark stamp" : "mark"}
        aria-pressed={done}
        aria-label={
          done
            ? `Clear ${detail.title} for today`
            : `Mark ${detail.title} for today`
        }
        onClick={handleMark}
      >
        <CheckIcon />
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
      className={
        paused || quiet
          ? "habit-reminder-row habit-reminder-row-quiet"
          : "habit-reminder-row"
      }
    >
      <div className="habit-reminder-copy">
        <div className={paused ? "habit-reminder-time muted mono" : "habit-reminder-time mono"}>
          {reminder.time}
        </div>
        <div className="habit-reminder-meta">
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
  const chipClass =
    day.status === "done"
      ? "chip chip-blue"
      : "chip chip-quiet";

  return (
    <li className="habit-log-row">
      <span className="habit-log-date mono">{day.label}</span>
      <span className="habit-log-qty mono">
        {day.quantity ?? "—"}
      </span>
      <span className={chipClass}>{statusLabel(day.status)}</span>
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
      <div className="page-head">
        <Link href="/habits" className="back-link mono">
          ← All habits
        </Link>
        <h1>Habit not found</h1>
        <p className="lede" style={{ marginTop: 12 }}>
          {habitQuery.error instanceof ApiError
            ? habitQuery.error.message
            : "This habit isn’t in your library."}
        </p>
        <p style={{ marginTop: 24 }}>
          <Link href="/habits" className="btn btn-primary">
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
        className="habit-detail-page"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <motion.header
          className="habit-detail-head"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <Link href="/habits" className="back-link mono">
            ← All habits
          </Link>

          <div className="habit-detail-title-row">
            <div
              className="habit-detail-glyph"
              style={{ background: base.tint }}
              aria-hidden
            >
              {base.emoji}
            </div>

            <div className="habit-detail-title-copy">
              <h1>{base.title}</h1>
              <div className="habit-detail-chips">
                <span className="chip chip-blue">{base.schedule}</span>
                {base.quantityLabel ? (
                  <span className="chip chip-quiet">{base.quantityLabel}</span>
                ) : null}
                {reminders[0] ? (
                  <span className="chip chip-quiet">{reminders[0].time}</span>
                ) : null}
              </div>
            </div>

            <div className="habit-detail-actions">
              <Link
                href="/habits/new"
                className="btn-icon"
                aria-label="Edit habit"
                title="Edit"
              >
                <Pencil size={18} strokeWidth={2.2} aria-hidden />
              </Link>
              <button
                type="button"
                className="btn-icon"
                aria-label={base.archived ? "Restore habit" : "Archive habit"}
                title={base.archived ? "Restore" : "Archive"}
                onClick={() => setArchiveOpen(true)}
              >
                <Archive size={18} strokeWidth={2.2} aria-hidden />
              </button>
            </div>
          </div>
        </motion.header>

        <motion.div variants={reduce ? undefined : fadeUpSoft}>
          <AiHabitCoach habitId={habitId} context={coachContext} />
        </motion.div>

        <motion.section
          className="habit-detail-section"
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
          className="grid-4 habit-detail-stats"
          aria-label="Habit stats"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <article className="stat card-hover">
            <div className="stat-k">Current streak</div>
            <div className="stat-v flame">
              {stats?.streak.current ?? base.currentStreak}
            </div>
            <div className="stat-n">days without a break</div>
          </article>
          <article className="stat card-hover">
            <div className="stat-k">Longest streak</div>
            <div className="stat-v">{stats?.streak.longest ?? base.longestStreak}</div>
            <div className="stat-n">
              {stats
                ? `${formatPrettyIso(stats.range.from, { day: "numeric", month: "short" })} → ${formatPrettyIso(stats.range.to, { day: "numeric", month: "short" })}`
                : base.longestRange}
            </div>
          </article>
          <article className="stat card-hover">
            <div className="stat-k">Completion</div>
            <div className="stat-v">
              {stats ? asPercent(stats.completion.rate) : base.completionRate}%
            </div>
            <div className="stat-n">
              {stats && stats.completion.due > 0
                ? `${stats.completion.done} of ${stats.completion.due} days`
                : "As you log days"}
            </div>
          </article>
          <article className="stat card-hover">
            <div className="stat-k">Total logged</div>
            <div className="stat-v">
              {formatTotal(stats?.totalValue ?? stats?.completion.done ?? 0)}
            </div>
            <div className="stat-n">{base.totalLoggedUnit}</div>
          </article>
        </motion.section>

        <motion.section
          className="card habit-chain-card"
          aria-labelledby="chain-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className="panel-head habit-chain-head">
            <div>
              <h2 id="chain-heading" className="section-title">
                The chain
              </h2>
              <p className="hint" style={{ marginTop: 4 }}>
                Last 364 days · hover a square for the date
              </p>
            </div>
            <div className="heat-legend" aria-hidden>
              <span>Less</span>
              <i style={{ background: "var(--l0)" }} />
              <i style={{ background: "var(--l1)" }} />
              <i style={{ background: "var(--l2)" }} />
              <i style={{ background: "var(--l3)" }} />
              <i style={{ background: "var(--l4)" }} />
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
          className="grid-2 habit-detail-charts"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <article className="card">
            <div className="panel-head">
              <div>
                <h2 className="section-title">Last 12 weeks</h2>
                <p className="hint" style={{ marginTop: 4 }}>
                  Weekly completion
                </p>
              </div>
            </div>
            {weekRates.length > 0 ? (
              <RateBars
                rates={weekRates}
                labels={weekLabels(weekRates.length)}
                ariaLabel="Last 12 weeks completion"
              />
            ) : (
              <p className="hint">Weekly completion appears after you log days.</p>
            )}
          </article>

          <article className="card">
            <div className="panel-head">
              <div>
                <h2 className="section-title">By weekday</h2>
                <p className="hint" style={{ marginTop: 4 }}>
                  Where the plan keeps failing
                </p>
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
                <p className="habit-weekday-insight">{insight}</p>
              </>
            ) : (
              <p className="hint">{insight}</p>
            )}
          </article>
        </motion.section>

        <motion.section
          className="grid-2 habit-detail-bottom"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <article className="card">
            <div className="panel-head">
              <h2 className="section-title">Reminders</h2>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setAddOpen(true)}
              >
                + Add
              </button>
            </div>
            <div className="habit-reminder-list">
              {reminders.length === 0 ? (
                <p className="hint">No reminders set for this habit.</p>
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
              <p className="hint habit-reminder-note">
                Today is already marked — reminders stay quiet.
              </p>
            ) : null}
          </article>

          <article className="card">
            <div className="panel-head">
              <h2 className="section-title">Recent days</h2>
            </div>
            {recentDays.length === 0 ? (
              <p className="hint">No logs yet for this habit.</p>
            ) : (
              <ul className="habit-log-list">
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
          <p className="hint" style={{ marginTop: 10, lineHeight: 1.55 }}>
            {base.archived
              ? "It comes back to Today and Habits. History stays on file."
              : "It leaves the daily list right away. History stays on file — restore from Habits anytime."}
          </p>
          <div className="settings-actions" style={{ marginTop: 22 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setArchiveOpen(false)}
              disabled={archiving}
            >
              {base.archived ? "Keep archived" : "Keep it active"}
            </button>
            <button
              type="button"
              className="btn btn-danger"
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
          <label className="field" style={{ marginTop: 14 }}>
            <span className="label">Time</span>
            <input
              className="input"
              type="time"
              value={addTime}
              onChange={(e) => setAddTime(e.target.value)}
            />
            <span className="hint">Sent in {user?.timezone || "your timezone"}.</span>
          </label>
          <div className="settings-actions" style={{ marginTop: 22 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setAddOpen(false)}
              disabled={createReminder.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
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

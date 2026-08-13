"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Pencil } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { useToast } from "@/components/auth/toast";
import {
  getHabitDetail,
  statusLabel,
  WEEKDAY_LABELS,
  type HabitDetail,
  type HabitReminder,
  type RecentDay,
} from "@/components/habits/habit-detail-data";
import { YearChain } from "@/components/habits/year-chain";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { ConfirmSheet } from "@/components/settings/confirm-sheet";
import { RateBars } from "@/components/stats/rate-bars";
import { Switch } from "@/components/ui/switch";

function formatPrettyDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

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

  const base = useMemo(() => getHabitDetail(habitId), [habitId]);
  const [marked, setMarked] = useState(base?.markedToday ?? false);
  const [reminders, setReminders] = useState(base?.reminders ?? []);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const todayLabel = useMemo(() => formatPrettyDate(new Date()), []);

  useEffect(() => {
    if (!base) return;
    setMarked(base.markedToday);
    setReminders(base.reminders);
  }, [base]);

  if (!base) {
    return (
      <div className="page-head">
        <Link href="/habits" className="back-link mono">
          ← All habits
        </Link>
        <h1>Habit not found</h1>
        <p className="lede" style={{ marginTop: 12 }}>
          This habit isn’t in the sample library.
        </p>
        <p style={{ marginTop: 24 }}>
          <Link href="/habits" className="btn btn-primary">
            Back to habits
          </Link>
        </p>
      </div>
    );
  }

  function toggleMark() {
    const next = !marked;
    setMarked(next);
    pushToast(
      next ? `Marked ${base!.title} for today` : `Cleared ${base!.title}`,
    );
  }

  function toggleReminder(id: string, enabled: boolean) {
    setReminders((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, enabled, paused: enabled ? false : true }
          : item,
      ),
    );
    pushToast(enabled ? "Reminder on" : "Reminder paused");
  }

  function confirmArchive() {
    setArchiveOpen(false);
    pushToast(`Archived ${base!.title}`);
    router.push("/habits/archived");
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
                {base.reminderLabel ? (
                  <span className="chip chip-quiet">{base.reminderLabel}</span>
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
                aria-label="Archive habit"
                title="Archive"
                onClick={() => setArchiveOpen(true)}
              >
                <Archive size={18} strokeWidth={2.2} aria-hidden />
              </button>
            </div>
          </div>
        </motion.header>

        <motion.section
          className="habit-detail-section"
          aria-label="Today’s mark"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <TodayMarkRow
            detail={base}
            done={marked}
            onToggle={toggleMark}
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
            <div className="stat-v flame">{base.currentStreak}</div>
            <div className="stat-n">days without a break</div>
          </article>
          <article className="stat card-hover">
            <div className="stat-k">Longest streak</div>
            <div className="stat-v">{base.longestStreak}</div>
            <div className="stat-n">{base.longestRange}</div>
          </article>
          <article className="stat card-hover">
            <div className="stat-k">Completion</div>
            <div className="stat-v">{base.completionRate}%</div>
            <div className="stat-n">
              {base.completedDays} of {base.trackedDays} days
            </div>
          </article>
          <article className="stat card-hover">
            <div className="stat-k">Total logged</div>
            <div className="stat-v">{formatTotal(base.totalLogged)}</div>
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
            seed={base.heatSeed}
            fillRate={base.fillRate}
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
            <RateBars
              rates={base.weekRates}
              labels={weekLabels(base.weekRates.length)}
              ariaLabel="Last 12 weeks completion"
            />
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
            <RateBars
              rates={base.weekdayRates}
              labels={WEEKDAY_LABELS}
              ariaLabel="Completion by weekday"
              hotThreshold={0.82}
            />
            <p className="habit-weekday-insight">{base.weekdayInsight}</p>
          </article>
        </motion.section>

        <motion.section
          className="grid-2 habit-detail-bottom"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <article className="card">
            <div className="panel-head">
              <h2 className="section-title">Reminders</h2>
              <button type="button" className="btn btn-sm btn-ghost">
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
                    onToggle={toggleReminder}
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
            <ul className="habit-log-list">
              {base.recentDays.map((day) => (
                <RecentDayRow key={day.id} day={day} />
              ))}
            </ul>
            <button type="button" className="btn btn-ghost btn-block habit-log-more">
              Load earlier days
            </button>
          </article>
        </motion.section>

        <ConfirmSheet
          open={archiveOpen}
          onClose={() => setArchiveOpen(false)}
          title="Archive this habit?"
        >
          <p className="hint" style={{ marginTop: 10, lineHeight: 1.55 }}>
            It leaves the daily list right away. History stays on file — restore
            from Habits anytime.
          </p>
          <div className="settings-actions" style={{ marginTop: 22 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setArchiveOpen(false)}
            >
              Keep it active
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={confirmArchive}
            >
              Archive habit
            </button>
          </div>
        </ConfirmSheet>
      </motion.div>
    </MotionConfig>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { useToast } from "@/components/auth/toast";
import { HabitPreview } from "@/components/habits/habit-preview";
import {
  COLOR_OPTIONS,
  ICON_OPTIONS,
  todayIsoDate,
  WEEKDAY_OPTIONS,
  type ColorId,
  type HabitType,
  type ScheduleInput,
  type ScheduleMode,
} from "@/components/habits/schedule-utils";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api/errors";
import { createHabitReminder } from "@/lib/api/reminders";
import { useAuth } from "@/lib/auth/context";
import { useCreateHabit } from "@/lib/habits/hooks";
import { toCreateHabitRequest } from "@/lib/habits/map";

export function NewHabitForm() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const create = useCreateHabit();

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [icon, setIcon] = useState<string>(ICON_OPTIONS[0]);
  const [colorId, setColorId] = useState<ColorId>("blue");
  const [habitType, setHabitType] = useState<HabitType>("building");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("daily");
  const [weekdays, setWeekdays] = useState<number[]>([1, 3, 6]);
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [intervalDays, setIntervalDays] = useState(3);
  const [startDate, setStartDate] = useState(todayIsoDate);
  const [measureTarget, setMeasureTarget] = useState("");
  const [measureUnit, setMeasureUnit] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("21:30");
  const [nameError, setNameError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const timezone =
    user?.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "UTC";

  const schedule: ScheduleInput = useMemo(
    () => ({
      mode: scheduleMode,
      weekdays,
      timesPerWeek,
      intervalDays,
      startDate,
    }),
    [scheduleMode, weekdays, timesPerWeek, intervalDays, startDate],
  );

  function toggleWeekday(value: number) {
    setWeekdays((prev) =>
      prev.includes(value)
        ? prev.filter((d) => d !== value)
        : [...prev, value].sort((a, b) => a - b),
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Give the habit a name");
      return;
    }
    if (scheduleMode === "weekdays" && weekdays.length === 0) {
      pushToast("Pick at least one weekday");
      return;
    }
    setNameError(null);
    setPending(true);
    try {
      const habit = await create.mutateAsync(
        toCreateHabitRequest({
          title: trimmed,
          note,
          icon,
          colorId,
          habitType,
          schedule,
          measureTarget,
          measureUnit,
        }),
      );
      if (reminderEnabled) {
        const daysOfWeek =
          scheduleMode === "weekdays" && weekdays.length > 0
            ? weekdays
            : [0, 1, 2, 3, 4, 5, 6];
        const timeLocal = reminderTime.slice(0, 5);
        try {
          const result = await createHabitReminder(habit.id, {
            timeLocal,
            daysOfWeek,
            enabled: true,
          });
          if (result.warnings[0]) pushToast(result.warnings[0]);
        } catch (error) {
          pushToast(
            error instanceof ApiError
              ? error.message
              : "Habit created, but the reminder could not be saved",
          );
        }
      }
      pushToast("Habit created 🎉");
      router.push("/habits");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Could not create habit";
      const fields = error instanceof ApiError ? error.fieldErrors() : {};
      setNameError(fields.title ?? fields.startDate ?? message);
      pushToast(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="new-habit-page"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <div className="new-habit-intro">
          <motion.div variants={reduce ? undefined : fadeUpSoft}>
            <Link href="/habits" className="back-link mono">
              ← All habits
            </Link>
          </motion.div>

          <motion.header
            className="page-head"
            variants={reduce ? undefined : fadeUpSoft}
          >
            <p className="eyebrow">New habit</p>
            <h1>What are you building?</h1>
            <p className="lede" style={{ marginTop: 12 }}>
              Name it the way you&apos;d say it out loud. Edits apply from today
              forward — history stays intact.
            </p>
          </motion.header>
        </div>

        <div className="new-habit-layout">
          <form className="new-habit-stack" onSubmit={onSubmit} noValidate>
            <motion.section
              className="card form-section"
              aria-labelledby="basics-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="panel-head">
                <h2 id="basics-heading" className="section-title">
                  Basics
                </h2>
              </div>

              <label className="field">
                <span className="label-row">
                  <span className="label">Habit name</span>
                  <span className="label-req" aria-hidden>
                    *
                  </span>
                </span>
                <input
                  className="input"
                  type="text"
                  name="name"
                  placeholder="Read 30 pages"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  aria-invalid={Boolean(nameError)}
                  aria-required="true"
                  required
                  disabled={pending}
                  autoFocus
                />
                {nameError ? (
                  <span className="hint hint-err">{nameError}</span>
                ) : null}
              </label>

              <label className="field">
                <span className="label">Note to yourself</span>
                <textarea
                  className="textarea"
                  name="note"
                  placeholder="Deep work reading, no phone in the room."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={pending}
                />
              </label>

              <fieldset className="field">
                <legend className="label">Icon</legend>
                <div className="swatches icon-swatches">
                  {ICON_OPTIONS.map((emoji) => (
                    <label
                      key={emoji}
                      className={icon === emoji ? "is-selected" : undefined}
                    >
                      <input
                        type="radio"
                        name="icon"
                        value={emoji}
                        checked={icon === emoji}
                        onChange={() => setIcon(emoji)}
                        disabled={pending}
                      />
                      <span aria-hidden>{emoji}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="field">
                <legend className="label">Colour</legend>
                <div className="swatches color-swatches">
                  {COLOR_OPTIONS.map((color) => (
                    <label
                      key={color.id}
                      className={`color-swatch color-${color.id}${colorId === color.id ? " is-selected" : ""}`}
                      title={color.label}
                    >
                      <input
                        type="radio"
                        name="color"
                        value={color.id}
                        checked={colorId === color.id}
                        onChange={() => setColorId(color.id)}
                        disabled={pending}
                      />
                      <span className="sr-only">{color.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="field">
                <legend className="label">Type</legend>
                <div className="opt-list">
                  <label>
                    <input
                      type="radio"
                      name="habitType"
                      value="building"
                      checked={habitType === "building"}
                      onChange={() => setHabitType("building")}
                      disabled={pending}
                    />
                    <span className="opt">
                      <span className="opt-dot" aria-hidden />
                      <span>
                        <span className="opt-t">Building</span>
                        <span className="opt-d">A thing I want to do</span>
                      </span>
                    </span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="habitType"
                      value="quitting"
                      checked={habitType === "quitting"}
                      onChange={() => setHabitType("quitting")}
                      disabled={pending}
                    />
                    <span className="opt">
                      <span className="opt-dot" aria-hidden />
                      <span>
                        <span className="opt-t">Quitting</span>
                        <span className="opt-d">A thing I want to stop</span>
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>
            </motion.section>

            <motion.section
              className="card form-section"
              aria-labelledby="schedule-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="panel-head">
                <div>
                  <h2 id="schedule-heading" className="section-title">
                    Schedule
                  </h2>
                  <p className="hint" style={{ marginTop: 6 }}>
                    Days you aren&apos;t due never break your streak
                  </p>
                </div>
              </div>

              <fieldset className="field">
                <legend className="label">When is it due?</legend>
                <div className="opt-list">
                  {(
                    [
                      ["daily", "Every day", "Due all seven days"],
                      ["weekdays", "Certain weekdays", "Pick exact days"],
                      [
                        "times_per_week",
                        "A number of times a week",
                        "Any days — the week is what counts",
                      ],
                      [
                        "interval",
                        "Every few days",
                        "Fixed gap from start date",
                      ],
                    ] as const
                  ).map(([mode, title, desc]) => (
                    <label key={mode}>
                      <input
                        type="radio"
                        name="scheduleMode"
                        value={mode}
                        checked={scheduleMode === mode}
                        onChange={() => setScheduleMode(mode)}
                        disabled={pending}
                      />
                      <span className="opt">
                        <span className="opt-dot" aria-hidden />
                        <span>
                          <span className="opt-t">{title}</span>
                          <span className="opt-d">{desc}</span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {scheduleMode === "weekdays" ? (
                <fieldset className="field">
                  <legend className="label">Weekdays</legend>
                  <div className="day-picker">
                    {WEEKDAY_OPTIONS.map((day) => (
                      <span key={day.value}>
                        <input
                          id={`weekday-${day.value}`}
                          type="checkbox"
                          checked={weekdays.includes(day.value)}
                          onChange={() => toggleWeekday(day.value)}
                          disabled={pending}
                        />
                        <label htmlFor={`weekday-${day.value}`}>
                          {day.label}
                        </label>
                      </span>
                    ))}
                  </div>
                </fieldset>
              ) : null}

              {scheduleMode === "times_per_week" ? (
                <label className="field">
                  <span className="label">Times per week</span>
                  <select
                    className="select"
                    value={timesPerWeek}
                    onChange={(e) =>
                      setTimesPerWeek(Number(e.target.value))
                    }
                    disabled={pending}
                  >
                    {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}× per week
                      </option>
                    ))}
                  </select>
                  <span className="hint">
                    Weekly streaks count completions, not which days you pick.
                  </span>
                </label>
              ) : null}

              {scheduleMode === "interval" ? (
                <div className="field-row">
                  <label className="field">
                    <span className="label">Every</span>
                    <input
                      className="input"
                      type="number"
                      min={2}
                      max={30}
                      value={intervalDays}
                      onChange={(e) =>
                        setIntervalDays(
                          Math.min(
                            30,
                            Math.max(2, Number(e.target.value) || 2),
                          ),
                        )
                      }
                      disabled={pending}
                    />
                  </label>
                  <div className="field interval-suffix">
                    <span className="label">&nbsp;</span>
                    <span className="interval-days-label">days</span>
                  </div>
                </div>
              ) : null}

              <label className="field">
                <span className="label">Start from</span>
                <input
                  className="input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={pending}
                />
              </label>
            </motion.section>

            <motion.section
              className="card form-section"
              aria-labelledby="measure-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="panel-head">
                <h2 id="measure-heading" className="section-title">
                  Measure it
                </h2>
                <span className="chip chip-quiet">Optional</span>
              </div>
              <p className="hint" style={{ marginTop: -8, marginBottom: 16 }}>
                Track an amount instead of a plain tick
              </p>
              <div className="field-row">
                <label className="field">
                  <span className="label">Daily target</span>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    placeholder="30"
                    value={measureTarget}
                    onChange={(e) => setMeasureTarget(e.target.value)}
                    disabled={pending}
                  />
                </label>
                <label className="field">
                  <span className="label">Unit</span>
                  <input
                    className="input"
                    type="text"
                    placeholder="pages, minutes, litres"
                    value={measureUnit}
                    onChange={(e) => setMeasureUnit(e.target.value)}
                    disabled={pending}
                  />
                </label>
              </div>
            </motion.section>

            <motion.section
              className="card form-section"
              aria-labelledby="reminder-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="panel-head">
                <h2 id="reminder-heading" className="section-title">
                  Reminder
                </h2>
                <div className="reminder-toggle">
                  <Switch
                    id="reminder-enabled"
                    checked={reminderEnabled}
                    onCheckedChange={setReminderEnabled}
                    disabled={pending}
                  />
                  <Label htmlFor="reminder-enabled" className="sr-only">
                    Enable reminder
                  </Label>
                </div>
              </div>

              <label className="field">
                <span className="label">Time</span>
                <input
                  className="input"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  disabled={pending || !reminderEnabled}
                />
                <span className="hint mono">
                  Sent in {timezone}. Reminders follow timezone changes in
                  Settings.
                </span>
              </label>
            </motion.section>

            <motion.div
              className="form-actions"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Creating…
                  </>
                ) : (
                  "Create habit"
                )}
              </button>
              <Link
                href="/habits"
                className="btn btn-ghost btn-lg"
                aria-disabled={pending}
              >
                Cancel
              </Link>
            </motion.div>
          </form>

          <motion.aside
            className="new-habit-preview-col"
            variants={reduce ? undefined : fadeUpSoft}
          >
            <HabitPreview
              name={name}
              icon={icon}
              colorId={colorId}
              habitType={habitType}
              schedule={schedule}
              measureTarget={measureTarget}
              measureUnit={measureUnit}
            />
          </motion.aside>
        </div>
      </motion.div>
    </MotionConfig>
  );
}

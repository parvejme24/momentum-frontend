"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { useToast } from "@/components/auth/toast";
import { HabitPreview } from "@/components/habits/habit-preview";
import { AiHabitIdeasPanel } from "@/components/ai/ai-habit-ideas-panel";
import { AiCreateHabitPanel } from "@/components/ai/ai-create-habit-panel";
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
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api/errors";
import { createHabitReminder } from "@/lib/api/reminders";
import { useAuth } from "@/lib/auth/context";
import { useCreateHabit, useHabit, useUpdateHabit } from "@/lib/habits/hooks";
import { habitToFormValues, toCreateHabitRequest } from "@/lib/habits/map";
import { AI_HABIT_PREFILL_KEY, type AiHabitIdeaPrefill } from "@/lib/ai/map";
import {
  backLink,
  btn,
  btnGhost,
  btnLg,
  btnPrimary,
  card,
  chip,
  chipQuiet,
  eyebrow,
  field,
  fieldRow,
  hint,
  hintErr,
  input,
  label,
  labelReq,
  lede,
  mono,
  pageHead,
  panelHead,
  sectionTitle,
  textarea,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

const SCHEDULE_OPTIONS = [
  ["daily", "Every day", "Due all seven days"],
  ["weekdays", "Certain weekdays", "Pick exact days"],
  ["times_per_week", "A number of times a week", "Any days — the week is what counts"],
  ["interval", "Every few days", "Fixed gap from start date"],
] as const satisfies ReadonlyArray<[ScheduleMode, string, string]>;

const OPT =
  "flex cursor-pointer items-start gap-3 rounded-md border border-ink/9 bg-paper-white px-4 py-3.5 transition-[transform,box-shadow,background,border-color] duration-normal ease-smooth hover:-translate-y-0.5 hover:shadow-paper-sm dark:bg-paper-raised";

const OPT_CHECKED =
  "border-blue bg-blue-soft shadow-paper-sm dark:border-[#8ba4c9]/40 dark:shadow-[var(--shadow-sm),var(--shadow-glow)]";

const OPT_DOT =
  "mt-[3px] size-[18px] shrink-0 rounded-full border border-ink/9 bg-solid-white";

const SELECT = cn(input, "cursor-pointer appearance-none pr-[38px]");


const SWATCH =
  "size-9 cursor-pointer rounded-md border border-ink/9 transition-[transform,box-shadow] duration-normal ease-smooth hover:-translate-y-[3px] dark:border-ink/14";

const SWATCH_SELECTED =
  "shadow-[0_0_0_2px_var(--paper),0_0_0_3px_color-mix(in_srgb,var(--blue)_45%,transparent)] dark:shadow-[0_0_0_3px_var(--paper),0_0_0_5px_rgba(139,164,201,0.55)]";

const COLOR_SWATCH: Record<ColorId, string> = {
  blue: "bg-blue-soft",
  flame: "bg-flame-soft",
  purple: "bg-[#efe8fb]",
  green: "bg-[#e8f5ee]",
  gold: "bg-[#fff4db]",
};

const FIELD_IN_ROW =
  "m-0 flex min-w-0 flex-col gap-[7px] [&_.font-mono]:mb-0 [&_.font-mono]:min-h-[calc(0.7rem*1.35*2)] [&_.font-mono]:leading-[1.35]";

export function NewHabitForm() {
  return <HabitForm />;
}

export function EditHabitForm({ habitId }: { habitId: string }) {
  return <HabitForm habitId={habitId} />;
}

function HabitForm({ habitId }: { habitId?: string }) {
  const isEdit = Boolean(habitId);
  const reduce = useReducedMotion();
  const router = useRouter();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const create = useCreateHabit();
  const update = useUpdateHabit();
  const habitQuery = useHabit(habitId ?? "");

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
  const [hydrated, setHydrated] = useState(!isEdit);

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

  const formValid = useMemo(() => {
    if (!name.trim()) return false;
    if (scheduleMode === "weekdays" && weekdays.length === 0) return false;
    return true;
  }, [name, scheduleMode, weekdays]);

  function toggleWeekday(value: number) {
    setWeekdays((prev) =>
      prev.includes(value)
        ? prev.filter((d) => d !== value)
        : [...prev, value].sort((a, b) => a - b),
    );
  }

  function applyAiIdea(prefill: AiHabitIdeaPrefill) {
    setName(prefill.name);
    setNote(prefill.note);
    setIcon(prefill.icon);
    setColorId(prefill.colorId);
    setHabitType(prefill.habitType);
    setScheduleMode(prefill.scheduleMode);
    setWeekdays(prefill.weekdays);
    setTimesPerWeek(prefill.timesPerWeek);
    setIntervalDays(prefill.intervalDays);
    setNameError(null);
  }

  useEffect(() => {
    if (!isEdit || !habitQuery.data || hydrated) return;
    const values = habitToFormValues(habitQuery.data);
    setName(values.name);
    setNote(values.note);
    setIcon(values.icon);
    setColorId(values.colorId);
    setHabitType(values.habitType);
    setScheduleMode(values.scheduleMode);
    setWeekdays(values.weekdays);
    setTimesPerWeek(values.timesPerWeek);
    setIntervalDays(values.intervalDays);
    setStartDate(values.startDate);
    setMeasureTarget(values.measureTarget);
    setMeasureUnit(values.measureUnit);
    setHydrated(true);
  }, [isEdit, habitQuery.data, hydrated]);

  useEffect(() => {
    if (isEdit) return;
    const raw = sessionStorage.getItem(AI_HABIT_PREFILL_KEY);
    if (!raw) return;
    try {
      const prefill = JSON.parse(raw) as AiHabitIdeaPrefill;
      applyAiIdea(prefill);
    } catch {
      /* ignore bad prefill */
    } finally {
      sessionStorage.removeItem(AI_HABIT_PREFILL_KEY);
    }
  }, []);

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
      const body = toCreateHabitRequest({
        title: trimmed,
        note,
        icon,
        colorId,
        habitType,
        schedule,
        measureTarget,
        measureUnit,
      });

      if (isEdit && habitId) {
        await update.mutateAsync({ id: habitId, body });
        pushToast("Habit updated");
        router.push(`/habits/${habitId}`);
        return;
      }

      const habit = await create.mutateAsync(body);
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
        error instanceof ApiError
          ? error.message
          : isEdit
            ? "Could not update habit"
            : "Could not create habit";
      const fields = error instanceof ApiError ? error.fieldErrors() : {};
      setNameError(fields.title ?? fields.startDate ?? message);
      pushToast(message);
    } finally {
      setPending(false);
    }
  }

  if (isEdit && habitQuery.isLoading) {
    return (
      <div className="min-w-0">
        <p className={hint}>Loading habit…</p>
      </div>
    );
  }

  if (isEdit && (habitQuery.error || !habitQuery.data)) {
    return (
      <div className="min-w-0">
        <Link href="/habits" className={cn(backLink, mono)}>
          ← All habits
        </Link>
        <p className={cn(hint, hintErr, "mt-4")}>
          {habitQuery.error instanceof ApiError
            ? habitQuery.error.message
            : "Could not load this habit"}
        </p>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="min-w-0"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <div>
          <motion.div variants={reduce ? undefined : fadeUpSoft}>
            <Link
              href={isEdit && habitId ? `/habits/${habitId}` : "/habits"}
              className={cn(backLink, mono)}
            >
              {isEdit ? "← Habit detail" : "← All habits"}
            </Link>
          </motion.div>

          <motion.header
            className={cn(pageHead, "mb-[22px]")}
            variants={reduce ? undefined : fadeUpSoft}
          >
            <p className={cn(eyebrow, "mb-2")}>{isEdit ? "Edit habit" : "New habit"}</p>
            <h1 className="mt-4">{isEdit ? "Update this habit" : "What are you building?"}</h1>
            <p className={cn(lede, "mt-3")}>
              {isEdit
                ? "Changes apply from today forward — your history stays intact."
                : "Name it the way you'd say it out loud. Edits apply from today forward — history stays intact."}
            </p>
          </motion.header>
        </div>

        <div className="grid grid-cols-1 items-start gap-[clamp(24px,3vw,36px)] wide:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <form className="grid min-w-0 gap-[18px]" onSubmit={onSubmit} noValidate>
            <motion.section
              className={card}
              aria-labelledby="basics-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className={panelHead}>
                <h2 id="basics-heading" className={sectionTitle}>
                  Basics
                </h2>
              </div>

              <label className={cn(field, "not-first:mt-0")}>
                <span className={label}>
                  Habit name
                  <span className={labelReq} aria-hidden>
                    *
                  </span>
                </span>
                <input
                  className={input}
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
                  <span className={cn(hint, hintErr)}>{nameError}</span>
                ) : null}
              </label>

              <label className={field}>
                <span className={label}>Note to yourself</span>
                <textarea
                  className={textarea}
                  name="note"
                  placeholder="Deep work reading, no phone in the room."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={pending}
                />
              </label>

              <fieldset className={cn(field, "min-w-0 border-0 p-0")}>
                <legend className={label}>Icon</legend>
                <p className={cn(hint, "-mt-1 mb-2.5 text-[0.78rem]")}>
                  {ICON_OPTIONS.length} icons · scroll for more
                </p>
                <div className="m-[-2px] grid max-h-[11.5rem] grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-2 overflow-x-hidden overflow-y-auto p-[2px_6px_2px_2px]">
                  {ICON_OPTIONS.map((emoji) => (
                    <label
                      key={emoji}
                      className={cn(
                        SWATCH,
                        "m-0 grid place-items-center bg-paper-white text-[1.15rem]",
                        icon === emoji && SWATCH_SELECTED,
                      )}
                    >
                      <input
                        type="radio"
                        name="icon"
                        value={emoji}
                        checked={icon === emoji}
                        onChange={() => setIcon(emoji)}
                        disabled={pending}
                        className="sr-only"
                      />
                      <span aria-hidden>{emoji}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className={cn(field, "min-w-0 border-0 p-0")}>
                <legend className={label}>Colour</legend>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <label
                      key={color.id}
                      className={cn(
                        SWATCH,
                        COLOR_SWATCH[color.id],
                        colorId === color.id && SWATCH_SELECTED,
                      )}
                      title={color.label}
                    >
                      <input
                        type="radio"
                        name="color"
                        value={color.id}
                        checked={colorId === color.id}
                        onChange={() => setColorId(color.id)}
                        disabled={pending}
                        className="sr-only"
                      />
                      <span className="sr-only">{color.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className={cn(field, "min-w-0 border-0 p-0")}>
                <legend className={label}>Type</legend>
                <div className="grid gap-2.5">
                  <label>
                    <input
                      type="radio"
                      name="habitType"
                      value="building"
                      checked={habitType === "building"}
                      onChange={() => setHabitType("building")}
                      disabled={pending}
                      className="sr-only"
                    />
                    <span
                      className={cn(OPT, habitType === "building" && OPT_CHECKED)}
                    >
                      <span
                        className={cn(
                          OPT_DOT,
                          habitType === "building" &&
                            "bg-blue shadow-[inset_0_0_0_3px_#fff]",
                        )}
                        aria-hidden
                      />
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="leading-[1.25] font-bold">Building</span>
                        <span className="text-[0.84rem] leading-[1.35] text-ink-50">
                          A thing I want to do
                        </span>
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
                      className="sr-only"
                    />
                    <span
                      className={cn(OPT, habitType === "quitting" && OPT_CHECKED)}
                    >
                      <span
                        className={cn(
                          OPT_DOT,
                          habitType === "quitting" &&
                            "bg-blue shadow-[inset_0_0_0_3px_#fff]",
                        )}
                        aria-hidden
                      />
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="leading-[1.25] font-bold">Quitting</span>
                        <span className="text-[0.84rem] leading-[1.35] text-ink-50">
                          A thing I want to stop
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>
            </motion.section>

            <motion.section
              className={card}
              aria-labelledby="schedule-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className={panelHead}>
                <div>
                  <h2 id="schedule-heading" className={sectionTitle}>
                    Schedule
                  </h2>
                  <p className={cn(hint, "mt-1.5")}>
                    Days you aren&apos;t due never break your streak
                  </p>
                </div>
              </div>

              <fieldset className={cn(field, "not-first:mt-0 min-w-0 border-0 p-0")}>
                <legend className={label}>When is it due?</legend>
                <div className="grid gap-3">
                  {SCHEDULE_OPTIONS.map(([mode, title, desc]) => {
                    const selected = scheduleMode === mode;
                    return (
                      <div key={mode}>
                        <label className="block cursor-pointer">
                          <input
                            type="radio"
                            name="scheduleMode"
                            value={mode}
                            checked={selected}
                            onChange={() => setScheduleMode(mode)}
                            disabled={pending}
                            className="sr-only"
                          />
                          <span
                            className={cn(
                              OPT,
                              selected && OPT_CHECKED,
                              selected && "rounded-b-none border-b-transparent",
                            )}
                          >
                            <span
                              className={cn(
                                OPT_DOT,
                                selected && "bg-blue shadow-[inset_0_0_0_3px_#fff]",
                              )}
                              aria-hidden
                            />
                            <span className="flex min-w-0 flex-col gap-1">
                              <span className="leading-[1.25] font-bold">{title}</span>
                              <span className="text-[0.84rem] leading-[1.35] text-ink-50">
                                {desc}
                              </span>
                            </span>
                          </span>
                        </label>

                        {selected ? (
                          <div
                            className={cn(
                              "rounded-b-md border border-t-0 border-blue bg-[color-mix(in_srgb,var(--blue-soft)_55%,var(--paper-white))] px-4 pt-3.5 pb-4 shadow-paper-sm dark:border-[#8ba4c9]/40 dark:bg-[color-mix(in_srgb,var(--blue-soft)_35%,var(--paper-raised))]",
                            )}
                          >
                            {mode === "daily" ? (
                              <p className={cn(hint, "mb-3.5 leading-[1.5]")}>
                                Due every calendar day — weekends count too.
                              </p>
                            ) : null}

                            {mode === "weekdays" ? (
                              <div className="mb-3.5">
                                <span className={cn(label, "mb-2")}>Weekdays</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {WEEKDAY_OPTIONS.map((day) => (
                                    <span key={day.value} className="relative">
                                      <input
                                        id={`weekday-${day.value}`}
                                        type="checkbox"
                                        checked={weekdays.includes(day.value)}
                                        onChange={() => toggleWeekday(day.value)}
                                        disabled={pending}
                                        className="peer sr-only"
                                      />
                                      <label
                                        htmlFor={`weekday-${day.value}`}
                                        className="grid size-[46px] cursor-pointer place-items-center rounded-md border border-ink/9 bg-paper-white font-mono text-[0.74rem] font-bold transition-[transform,background,color,box-shadow] duration-normal ease-smooth hover:-translate-y-[3px] peer-checked:bg-blue peer-checked:text-solid-white peer-checked:shadow-[var(--focus-ring)] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-flame"
                                      >
                                        {day.label}
                                      </label>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            {mode === "times_per_week" ? (
                              <label className={cn(field, "m-0")}>
                                <span className={label}>Times per week</span>
                                <div className="relative">
                                  <select
                                    className={cn(SELECT, "min-h-[2.875rem] shadow-[inset_0_1px_2px_rgba(20,26,46,0.05)]")}
                                    value={timesPerWeek}
                                    onChange={(e) =>
                                      setTimesPerWeek(Number(e.target.value))
                                    }
                                    disabled={pending}
                                  >
                                    {Array.from({ length: 7 }, (_, i) => i + 1).map(
                                      (n) => (
                                        <option key={n} value={n}>
                                          {n}× per week
                                        </option>
                                      ),
                                    )}
                                  </select>
                                  <ChevronDown
                                    size={14}
                                    strokeWidth={2.4}
                                    aria-hidden
                                    className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink"
                                  />
                                </div>
                                <span className={hint}>
                                  Weekly streaks count completions, not which
                                  days you pick.
                                </span>
                              </label>
                            ) : null}

                            {mode === "interval" ? (
                              <div className={cn(fieldRow, "items-end")}>
                                <label className={cn(field, FIELD_IN_ROW)}>
                                  <span className={label}>Every</span>
                                  <div className="flex items-center gap-2.5">
                                    <input
                                      className={cn(
                                        input,
                                        "m-0 w-[5.75rem] shrink-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                                      )}
                                      type="number"
                                      min={2}
                                      max={30}
                                      value={intervalDays}
                                      onChange={(e) =>
                                        setIntervalDays(
                                          Math.min(
                                            30,
                                            Math.max(
                                              2,
                                              Number(e.target.value) || 2,
                                            ),
                                          ),
                                        )
                                      }
                                      disabled={pending}
                                    />
                                    <span className="p-0 font-semibold text-ink-70">
                                      days
                                    </span>
                                  </div>
                                </label>
                                <div className={cn(field, FIELD_IN_ROW)}>
                                  <span className={label}>Start from</span>
                                  <DatePicker
                                    value={startDate}
                                    onChange={setStartDate}
                                    disabled={pending}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className={cn(field, "m-0")}>
                                <span className={label}>Start from</span>
                                <DatePicker
                                  value={startDate}
                                  onChange={setStartDate}
                                  disabled={pending}
                                />
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            </motion.section>

            <motion.section
              className={card}
              aria-labelledby="measure-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className={panelHead}>
                <h2 id="measure-heading" className={sectionTitle}>
                  Measure it
                </h2>
                <span className={cn(chip, chipQuiet)}>Optional</span>
              </div>
              <p className={cn(hint, "-mt-2 mb-4")}>
                Track an amount instead of a plain tick
              </p>
              <div className={fieldRow}>
                <label className={cn(field, FIELD_IN_ROW)}>
                  <span className={label}>Daily target</span>
                  <input
                    className={cn(
                      input,
                      "m-0 min-h-[2.875rem] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                    )}
                    type="number"
                    min={0}
                    placeholder="30"
                    value={measureTarget}
                    onChange={(e) => setMeasureTarget(e.target.value)}
                    disabled={pending}
                  />
                </label>
                <label className={cn(field, FIELD_IN_ROW)}>
                  <span className={label}>Unit</span>
                  <input
                    className={cn(input, "m-0 min-h-[2.875rem]")}
                    type="text"
                    placeholder="pages, minutes, litres"
                    value={measureUnit}
                    onChange={(e) => setMeasureUnit(e.target.value)}
                    disabled={pending}
                  />
                </label>
              </div>
            </motion.section>

            {!isEdit ? (
              <motion.section
                className={card}
                aria-labelledby="reminder-heading"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div className={panelHead}>
                  <h2 id="reminder-heading" className={sectionTitle}>
                    Reminder
                  </h2>
                  <div className="flex items-center">
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

                <label className={cn(field, "not-first:mt-0")}>
                  <span className={label}>Time</span>
                  <TimePicker
                    value={reminderTime}
                    onChange={setReminderTime}
                    disabled={pending || !reminderEnabled}
                  />
                  <span className={cn(hint, mono)}>
                    Sent in {timezone}. Reminders follow timezone changes in
                    Settings.
                  </span>
                </label>
              </motion.section>
            ) : null}

            <motion.div
              className="flex flex-wrap gap-3 pt-1 [&_a]:min-w-0 [&_button]:min-w-0"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <button
                type="submit"
                className={cn(btn, btnPrimary, btnLg)}
                disabled={pending || !formValid}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    {isEdit ? "Saving…" : "Creating…"}
                  </>
                ) : isEdit ? (
                  "Save changes"
                ) : (
                  "Create habit"
                )}
              </button>
              <Link
                href={isEdit && habitId ? `/habits/${habitId}` : "/habits"}
                className={cn(btn, btnGhost, btnLg)}
                aria-disabled={pending}
              >
                Cancel
              </Link>
            </motion.div>
          </form>

          <motion.aside
            className="grid min-w-0 gap-[18px] wide:sticky wide:top-[26px] [&>*]:mt-0"
            variants={reduce ? undefined : fadeUpSoft}
          >
            {!isEdit ? (
              <>
                <AiCreateHabitPanel onApply={(prefill) => applyAiIdea(prefill)} />
                <AiHabitIdeasPanel onApply={(prefill) => applyAiIdea(prefill)} />
              </>
            ) : null}
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

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock3 } from "lucide-react";

import { buttons, fieldControl } from "@/lib/ui";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const PERIODS = ["AM", "PM"] as const;

type Period = (typeof PERIODS)[number];

function parseTime24(value: string) {
  const [hourPart, minutePart] = value.split(":");
  const hour24 = Number(hourPart);
  const minute = Number(minutePart);
  return {
    hour24: Number.isFinite(hour24) ? hour24 : 0,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

function to12Hour(hour24: number) {
  const period: Period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return { hour12, period };
}

function to24Hour(hour12: number, period: Period) {
  if (period === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function toTime24(hour12: number, minute: number, period: Period) {
  const hour24 = to24Hour(hour12, period);
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatTimeDisplay(value: string) {
  const { hour24, minute } = parseTime24(value);
  const { hour12, period } = to12Hour(hour24);
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

function nearestMinuteStep(minute: number, step = 5) {
  return Math.min(55, Math.round(minute / step) * step);
}

const triggerClass = cn(fieldControl, "flex items-center gap-2.5 text-left cursor-pointer");

const cellClass =
  "grid min-h-[2.1rem] cursor-pointer place-items-center rounded-[calc(var(--radius)-2px)] border border-transparent bg-paper-white font-mono text-[0.8rem] font-semibold text-ink transition-[border-color,background-color,box-shadow,color] duration-normal ease-smooth hover:border-blue/25 hover:bg-[color-mix(in_srgb,var(--blue-soft)_55%,var(--paper-white))]";

const cellSelected =
  "border-blue bg-blue text-solid-white shadow-paper-sm";

export function TimePicker({
  value,
  onChange,
  disabled,
  id,
  placeholder = "Pick a time",
  minuteStep = 5,
}: {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  minuteStep?: number;
}) {
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const parsed = parseTime24(value);
  const initial12 = to12Hour(parsed.hour24);
  const [hour12, setHour12] = useState(initial12.hour12);
  const [minute, setMinute] = useState(nearestMinuteStep(parsed.minute, minuteStep));
  const [period, setPeriod] = useState<Period>(initial12.period);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const next = parseTime24(value);
    const next12 = to12Hour(next.hour24);
    setHour12(next12.hour12);
    setMinute(nearestMinuteStep(next.minute, minuteStep));
    setPeriod(next12.period);
  }, [value, minuteStep]);

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = 300;
      const height = 420;
      let left = rect.left;
      let top = rect.bottom + 8;

      if (left + width > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - width - 12);
      }
      if (top + height > window.innerHeight - 12) {
        top = Math.max(12, rect.top - height - 8);
      }

      setPosition({ top, left });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function commit(nextHour12: number, nextMinute: number, nextPeriod: Period) {
    onChange(toTime24(nextHour12, nextMinute, nextPeriod));
  }

  function updateHour(nextHour12: number) {
    setHour12(nextHour12);
    commit(nextHour12, minute, period);
  }

  function updateMinute(nextMinute: number) {
    setMinute(nextMinute);
    commit(hour12, nextMinute, period);
  }

  function updatePeriod(nextPeriod: Period) {
    setPeriod(nextPeriod);
    commit(hour12, minute, nextPeriod);
  }

  const minuteOptions =
    minuteStep === 5
      ? MINUTES
      : Array.from({ length: 60 }, (_, i) => i);

  const popover =
    open && mounted ? (
      <div
        ref={popoverRef}
        className="fixed z-90 w-[min(300px,calc(100vw-24px))] rounded-lg border-[var(--stroke)] bg-paper p-3.5 shadow-lift animate-sheet-in dark:bg-paper-raised"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ top: position.top, left: position.left }}
      >
        <div className="mb-3 flex items-baseline justify-center gap-1.5 rounded-md bg-[color-mix(in_srgb,var(--blue-soft)_55%,var(--paper-white))] px-3 py-2.5 dark:bg-[color-mix(in_srgb,var(--blue-soft)_30%,var(--paper-raised))]" aria-hidden>
          <span className="font-heading text-[2rem] leading-none font-extrabold tracking-[-0.04em]">
            {hour12}
          </span>
          <span className="font-heading text-[1.6rem] font-extrabold text-ink-50">
            :
          </span>
          <span className="font-heading text-[2rem] leading-none font-extrabold tracking-[-0.04em]">
            {String(minute).padStart(2, "0")}
          </span>
          <span className="ml-1 font-mono text-[0.78rem] font-bold tracking-[0.08em] text-ink-70">
            {period}
          </span>
        </div>

        <div className="mb-3.5 grid grid-cols-2 gap-2" role="group" aria-label="AM or PM">
          {PERIODS.map((item) => (
            <button
              key={item}
              type="button"
              className={cn(
                "min-h-9 cursor-pointer rounded-md border-[var(--stroke)] bg-paper-white font-mono text-[0.72rem] font-bold tracking-[0.1em] text-ink-70 transition-[border-color,background-color,box-shadow,color] duration-normal ease-smooth",
                "hover:border-blue/30 hover:bg-[color-mix(in_srgb,var(--blue-soft)_45%,var(--paper-white))]",
                period === item && cellSelected,
              )}
              aria-pressed={period === item}
              onClick={() => updatePeriod(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div>
          <p
            id={titleId}
            className="mb-2 font-mono text-[0.62rem] font-bold tracking-[0.12em] text-ink-50 uppercase"
          >
            Hour
          </p>
          <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Hour">
            {HOURS.map((hour) => (
              <button
                key={hour}
                type="button"
                className={cn(cellClass, hour12 === hour && cellSelected)}
                aria-pressed={hour12 === hour}
                onClick={() => updateHour(hour)}
              >
                {hour}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="mb-2 font-mono text-[0.62rem] font-bold tracking-[0.12em] text-ink-50 uppercase">
            Minute
          </p>
          <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Minute">
            {minuteOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={cn(cellClass, minute === item && cellSelected)}
                aria-pressed={minute === item}
                onClick={() => updateMinute(item)}
              >
                {String(item).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3.5 flex justify-end border-t border-ink/8 pt-3">
          <button
            type="button"
            className={buttons("primary", "sm")}
            onClick={() => setOpen(false)}
          >
            Done
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={triggerClass}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Clock3 size={16} strokeWidth={2.2} aria-hidden />
        <span className="min-w-0 flex-1 font-semibold tracking-[-0.01em]">
          {value ? formatTimeDisplay(value) : placeholder}
        </span>
      </button>
      {mounted && popover ? createPortal(popover, document.body) : null}
    </div>
  );
}

export function formatTimeLabel(value: string) {
  return formatTimeDisplay(value);
}

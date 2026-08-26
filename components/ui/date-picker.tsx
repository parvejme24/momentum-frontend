"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { formatPrettyIso } from "@/lib/dates";
import { buttons, fieldControl } from "@/lib/ui";
import { cn } from "@/lib/utils";

const WEEK_START = 1;
const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function parseIsoLocal(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function toIsoLocal(date: Date) {
  return format(date, "yyyy-MM-dd");
}

const triggerClass = cn(fieldControl, "flex items-center gap-2.5 text-left cursor-pointer");

export function DatePicker({
  value,
  onChange,
  disabled,
  id,
  placeholder = "Pick a date",
}: {
  value: string;
  onChange: (iso: string) => void;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
}) {
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    value ? parseIsoLocal(value) : new Date(),
  );
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const selected = value ? parseIsoLocal(value) : null;
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: WEEK_START });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: WEEK_START });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (value) setViewMonth(parseIsoLocal(value));
  }, [value]);

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = 320;
      const height = 360;
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

  function pickDay(day: Date) {
    onChange(toIsoLocal(day));
    setOpen(false);
  }

  function pickToday() {
    const today = new Date();
    onChange(toIsoLocal(today));
    setViewMonth(today);
    setOpen(false);
  }

  const popover =
    open && mounted ? (
      <div
        ref={popoverRef}
        className="fixed z-90 w-[min(320px,calc(100vw-24px))] rounded-lg border-[var(--stroke)] bg-paper p-3.5 shadow-lift animate-sheet-in dark:bg-paper-raised"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ top: position.top, left: position.left }}
      >
        <div className="mb-3 grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <button
            type="button"
            className={buttons("icon", "icon", "size-9")}
            aria-label="Previous month"
            onClick={() => setViewMonth((month) => subMonths(month, 1))}
          >
            <ChevronLeft size={18} strokeWidth={2.2} aria-hidden />
          </button>
          <div className="text-center">
            <p
              id={titleId}
              className="m-0 font-heading text-[1.05rem] font-extrabold tracking-[-0.03em]"
            >
              {format(viewMonth, "MMMM yyyy")}
            </p>
          </div>
          <button
            type="button"
            className={buttons("icon", "icon", "size-9")}
            aria-label="Next month"
            onClick={() => setViewMonth((month) => addMonths(month, 1))}
          >
            <ChevronRight size={18} strokeWidth={2.2} aria-hidden />
          </button>
        </div>

        <div className="mb-1.5 grid grid-cols-7 gap-1" aria-hidden>
          {WEEKDAY_LABELS.map((label) => (
            <span
              key={label}
              className="text-center font-mono text-[0.62rem] font-bold tracking-[0.1em] text-ink-50 uppercase"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Calendar">
          {days.map((day) => {
            const inMonth = isSameMonth(day, viewMonth);
            const isSelected = selected ? isSameDay(day, selected) : false;
            const today = isToday(day);

            return (
              <button
                key={day.toISOString()}
                type="button"
                role="gridcell"
                className={cn(
                  "grid min-h-[2.35rem] cursor-pointer place-items-center rounded-[calc(var(--radius)-2px)] border border-transparent bg-paper-white font-mono text-[0.82rem] font-semibold text-ink transition-[transform,border-color,background-color,box-shadow] duration-normal ease-smooth",
                  "hover:-translate-y-px hover:border-blue/25 hover:bg-[color-mix(in_srgb,var(--blue-soft)_55%,var(--paper-white))] hover:shadow-paper-sm",
                  !inMonth &&
                    "bg-[color-mix(in_srgb,var(--paper)_88%,var(--ink-12))] text-ink-50 dark:bg-[color-mix(in_srgb,var(--paper)_70%,var(--paper-raised))]",
                  today && "border-blue/35",
                  isSelected &&
                    "border-blue bg-blue text-solid-white shadow-paper-sm hover:border-[color-mix(in_srgb,var(--blue)_88%,#000)] hover:bg-[color-mix(in_srgb,var(--blue)_88%,#000)] hover:text-solid-white",
                )}
                aria-label={format(day, "EEEE, d MMMM yyyy")}
                aria-selected={isSelected}
                onClick={() => pickDay(day)}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex justify-end border-t border-ink/8 pt-3">
          <button type="button" className={buttons("ghost", "sm")} onClick={pickToday}>
            Today
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
        <CalendarDays size={16} strokeWidth={2.2} aria-hidden />
        <span className="min-w-0 flex-1 font-semibold tracking-[-0.01em]">
          {value ? formatPrettyIso(value) : placeholder}
        </span>
      </button>
      {mounted && popover ? createPortal(popover, document.body) : null}
    </div>
  );
}

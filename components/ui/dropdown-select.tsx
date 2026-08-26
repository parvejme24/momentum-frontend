"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";

import { fieldControl } from "@/lib/ui";
import { cn } from "@/lib/utils";

export type DropdownOption = {
  value: string;
  label: string;
  hint?: string;
};

export function DropdownSelect({
  value,
  onChange,
  options,
  placeholder = "Choose one",
  disabled,
  id,
  icon: Icon,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  icon?: LucideIcon;
  "aria-label"?: string;
}) {
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const selected = options.find((option) => option.value === value);

  function measurePosition() {
    const trigger = triggerRef.current;
    if (!trigger) return null;
    const rect = trigger.getBoundingClientRect();
    const maxHeight = 280;
    let top = rect.bottom + 8;
    let left = rect.left;

    if (left + rect.width > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - rect.width - 12);
    }
    if (top + maxHeight > window.innerHeight - 12) {
      top = Math.max(12, rect.top - maxHeight - 8);
    }

    return { top, left, width: rect.width };
  }

  function toggleOpen() {
    if (open) {
      setOpen(false);
      return;
    }
    const next = measurePosition();
    if (next) setPosition(next);
    setOpen(true);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const next = measurePosition();
      if (next) setPosition(next);
    }

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
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
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

  function pick(next: string) {
    onChange(next);
    setOpen(false);
  }

  const popover =
    open && mounted && position.width > 0 ? (
      <div
        ref={popoverRef}
        className={cn(
          "fixed z-100 max-h-70 overflow-hidden p-1.5",
          "rounded-xl border border-ink/8 bg-popover text-popover-foreground shadow-lift",
        )}
        role="listbox"
        id={listId}
        aria-label={ariaLabel ?? placeholder}
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
        }}
      >
        <ul className="m-0 max-h-67 list-none overflow-y-auto p-0">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2.5",
                    "rounded-lg border-0 bg-transparent text-left font-inherit text-inherit",
                    "transition-colors outline-none",
                    "hover:bg-blue-soft/40",
                    "dark:hover:bg-blue-soft/22",
                    isSelected && "bg-blue-soft/65 dark:bg-blue-soft/32",
                  )}
                  onClick={() => pick(option.value)}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold tracking-tight leading-tight">
                      {option.label}
                    </span>
                    {option.hint ? (
                      <span className="mt-0.5 block truncate font-mono text-[0.72rem] leading-snug text-muted-foreground tabular-nums">
                        {option.hint}
                      </span>
                    ) : null}
                  </span>
                  {isSelected ? (
                    <Check
                      className="shrink-0 text-blue"
                      size={16}
                      strokeWidth={2.4}
                      aria-hidden
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    ) : null;

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={cn(
          fieldControl,
          "flex items-center gap-2.5 text-left",
          "cursor-pointer",
          open && "border-blue/28 shadow-[var(--focus-ring)]",
        )}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        onClick={toggleOpen}
      >
        {Icon ? (
          <Icon className="shrink-0 text-blue" size={16} strokeWidth={2.2} aria-hidden />
        ) : null}
        <span
          className={cn(
            "min-w-0 flex-1 truncate tracking-tight",
            selected ? "font-semibold" : "font-medium text-muted-foreground",
          )}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "shrink-0 text-muted-foreground transition-transform duration-200 ease-out",
            open && "rotate-180 text-blue",
          )}
          size={16}
          strokeWidth={2.2}
          aria-hidden
        />
      </button>
      {mounted && popover ? createPortal(popover, document.body) : null}
    </div>
  );
}

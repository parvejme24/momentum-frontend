"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { easeSmooth } from "@/components/home/motion";
import type { FaqItem } from "@/components/marketing/faq-data";
import { cn } from "@/lib/utils";
import { card, muted } from "@/lib/ui";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  function toggle(question: string) {
    setOpen((prev) => ({ ...prev, [question]: !prev[question] }));
  }

  return (
    <div className="mt-0 grid grid-cols-1 items-start gap-[var(--space-2)] wide:grid-cols-2">
      {items.map((item, index) => {
        const isOpen = Boolean(open[item.q]);
        const panelId = `faq-panel-${index}`;

        return (
          <article
            key={item.q}
            className={cn(
              card,
              "m-0 overflow-hidden p-0 shadow-paper-sm transition-shadow duration-normal ease-smooth",
              isOpen && "shadow-paper",
            )}
            data-open={isOpen ? "true" : undefined}
          >
            <button
              type="button"
              className={cn(
                "flex w-full cursor-pointer list-none items-center justify-between gap-[var(--space-2)] border-0 border-b-2 border-transparent bg-transparent px-5 py-4 text-left font-inherit select-none transition-[border-color] duration-normal ease-smooth focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue",
                isOpen && "border-ink-12 dark:border-[rgba(221,216,207,0.1)]",
              )}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(item.q)}
            >
              <span
                className={cn(
                  "font-heading text-[1.05rem] font-bold leading-[1.35] tracking-[-0.02em] text-ink transition-colors duration-fast ease-smooth",
                  isOpen && "text-blue-deep",
                )}
              >
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "shrink-0 text-ink-50 transition-[transform,color] duration-normal ease-smooth",
                  isOpen && "rotate-180 text-blue",
                )}
                size={18}
                strokeWidth={2.4}
                aria-hidden
              />
            </button>

            <motion.div
              id={panelId}
              role="region"
              aria-hidden={!isOpen}
              className="overflow-hidden px-5"
              initial={false}
              animate={
                isOpen
                  ? { height: "auto", opacity: 1 }
                  : { height: 0, opacity: 0 }
              }
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      height: { duration: 0.38, ease: easeSmooth },
                      opacity: { duration: 0.28, ease: easeSmooth },
                    }
              }
            >
              <div className="min-h-0 overflow-hidden py-3 pb-4">
                <p className={cn(muted, "m-0 text-[0.92rem] leading-[1.55]")}>
                  {item.a}
                </p>
              </div>
            </motion.div>
          </article>
        );
      })}
    </div>
  );
}

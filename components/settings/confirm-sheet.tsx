"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { easeOut } from "@/components/home/motion";
import { sectionTitle } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function ConfirmSheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center content-center justify-center bg-[rgba(20,26,46,0.5)] p-5 backdrop-blur-[3px] animate-fade"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.32, ease: easeOut }}
          onClick={onClose}
        >
          <motion.div
            className={cn(
              "w-[min(520px,100%)] max-h-[86vh] overflow-y-auto rounded-2xl bg-popover p-5 text-popover-foreground shadow-lift ring-1 ring-ink/8 animate-sheet-in",
              className,
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.42, ease: easeOut }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={titleId} className={cn(sectionTitle, "text-[1.35rem]")}>
              {title}
            </h2>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

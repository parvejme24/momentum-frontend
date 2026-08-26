"use client";

import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { BrandLink } from "@/components/home/brand-mark";
import { InkButton } from "@/components/home/ink-button";
import { fadeUp, staggerContainer } from "@/components/home/motion";
import { BlankChain } from "@/components/not-found/blank-chain";
import { cn } from "@/lib/utils";
import { eyebrow, hDisplay, lede, wrap, wrapNarrow } from "@/lib/ui";

const ghost =
  "relative isolate inline-block pr-[5px] pb-[5px] before:pointer-events-none before:absolute before:top-[5px] before:left-[5px] before:z-0 before:animate-[misregister_5.2s_var(--ease)_infinite] before:text-flame before:opacity-85 before:select-none before:content-[attr(data-ghost)] max-[640px]:before:top-[3px] max-[640px]:before:left-[3px] motion-reduce:before:animate-none";

export function NotFoundPage() {
  const reduce = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-svh flex-col">
        <header className="border-b border-[var(--stroke)] bg-paper">
          <div className={cn(wrap, "flex h-[70px] items-center justify-between gap-4 max-[640px]:h-16")}>
            <BrandLink size="lg" />
            <InkButton href="/dashboard" variant="ghost" size="sm">
              Back to today
            </InkButton>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-[clamp(32px,6vw,80px)] pb-[clamp(40px,7vw,88px)] max-[640px]:py-7 max-[640px]:pb-12">
          <motion.div
            className={cn(wrapNarrow, "flex flex-col items-center text-center")}
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={reduce ? undefined : staggerContainer}
          >
            <motion.p
              className={cn(eyebrow, "text-flame")}
              variants={reduce ? undefined : fadeUp}
            >
              Error 404
            </motion.p>

            <motion.h1
              className={cn(hDisplay, "mt-3.5 leading-[1.05]")}
              variants={reduce ? undefined : fadeUp}
            >
              <span className={ghost} data-ghost="Blank day.">
                <span className="relative z-1 text-ink">Blank day.</span>
              </span>
            </motion.h1>

            <motion.p
              className={cn(lede, "mt-4 max-w-[38ch]")}
              variants={reduce ? undefined : fadeUp}
            >
              This page doesn’t exist — nothing was logged here. Habits and
              marked days are exactly where they were left.
            </motion.p>

            <motion.div
              className="mt-[clamp(28px,4vw,40px)] w-full"
              variants={reduce ? undefined : fadeUp}
            >
              <BlankChain />
            </motion.div>

            <motion.div
              className="mt-[clamp(28px,4vw,40px)] flex flex-wrap justify-center gap-4 max-[640px]:w-full max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-3"
              variants={reduce ? undefined : fadeUp}
            >
              <InkButton href="/dashboard" size="lg" className="max-[640px]:w-full">
                Go to today
              </InkButton>
              <InkButton href="/" variant="ghost" size="lg" className="max-[640px]:w-full">
                Back to the homepage
              </InkButton>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </MotionConfig>
  );
}

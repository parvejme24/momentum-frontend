"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { BrandLink } from "@/components/home/brand-mark";
import { DemoLink } from "@/components/home/demo-link";
import { InkButton } from "@/components/home/ink-button";
import { MotionItem, MotionSection, easeOut } from "@/components/home/motion";
import { cn } from "@/lib/utils";
import {
  btn,
  btnFlame,
  btnGhost,
  btnLg,
  btnSm,
  eyebrow,
  hint,
  hintErr,
  input,
  lede,
  mono,
  muted,
  row,
  section,
  wrap,
} from "@/lib/ui";

export function ClosingCta() {
  const reduce = useReducedMotion();

  return (
    <MotionSection className={section}>
      <div className={wrap}>
        <MotionItem
          className="rounded-lg border border-[var(--stroke)] bg-[var(--cta-band-bg)] px-[var(--space-page)] py-[var(--space-5)] text-center text-[var(--cta-band-fg)] shadow-lift"
          hoverLift
        >
          <motion.p
            className={cn(eyebrow, "text-flame")}
            animate={
              reduce
                ? undefined
                : { opacity: [0.7, 1, 0.7] }
            }
            transition={
              reduce
                ? undefined
                : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
            }
          >
            Begin
          </motion.p>
          <h2 className="mt-[var(--space-2)] text-[var(--cta-band-fg)]">
            The first square is the hard one.
          </h2>
          <p
            className={cn(
              lede,
              "mx-auto mt-[var(--space-2)] text-[color-mix(in_srgb,var(--cta-band-fg)_72%,transparent)]",
            )}
          >
            After that, it’s just another day in the chain. Start a free logbook,
            or look around the demo first.
          </p>
          <motion.div
            className={cn(row, "mt-[var(--space-4)] flex-wrap justify-center")}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: easeOut, delay: 0.15 }}
          >
            <InkButton href="/register" variant="flame" size="lg">
              Create your account
            </InkButton>
            <DemoLink className={cn(btn, btnGhost, btnLg)}>
              Look around first
            </DemoLink>
          </motion.div>
        </MotionItem>
      </div>
    </MotionSection>
  );
}

const WEEK = [
  { day: "S", level: "" },
  { day: "M", level: "l1" },
  { day: "T", level: "l2" },
  { day: "W", level: "l2" },
  { day: "T", level: "l3" },
  { day: "F", level: "l4" },
  { day: "S", level: "today" },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NEWSLETTER_KEY = "momentum.newsletter";

const SQ_LEVEL: Record<string, string> = {
  l1: "bg-l1",
  l2: "bg-l2",
  l3: "bg-l3",
  l4: "bg-l4",
  today: "border-flame bg-flame shadow-paper-sm",
};

function NewsletterSubscribe() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setSubscribed(window.localStorage.getItem(NEWSLETTER_KEY) === "1");
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email");
      return;
    }
    window.localStorage.setItem(NEWSLETTER_KEY, "1");
    setError("");
    setSubscribed(true);
  }

  if (subscribed) {
    return (
      <div>
        <p className={eyebrow}>Subscribed</p>
        <p className="mt-[var(--space-2)] max-w-[34ch] text-[0.95rem] leading-normal text-ink-70">
          You’re on the list. We’ll write when it counts — no streaks, no spam.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className={eyebrow}>Newsletter</p>
      <p className="mt-[var(--space-2)] max-w-[34ch] text-[0.95rem] leading-normal text-ink-70">
        A short note when the logbook changes. No streaks. No spam.
      </p>
      <form
        className="mt-3.5 flex max-w-[260px] items-stretch gap-1.5 max-[640px]:max-w-full max-[640px]:flex-col max-[640px]:items-stretch"
        onSubmit={onSubmit}
        noValidate
      >
        <label className="sr-only" htmlFor="footer-newsletter-email">
          Email
        </label>
        <input
          id="footer-newsletter-email"
          className={cn(input, "h-9 min-w-0 flex-1 px-2.5 py-1.5 text-[0.82rem]")}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "footer-newsletter-error" : undefined}
        />
        <button
          className={cn(btn, btnFlame, btnSm, "h-9 shrink-0 px-3 text-[0.78rem] max-[640px]:w-full")}
          type="submit"
        >
          Subscribe
        </button>
      </form>
      {error ? (
        <span id="footer-newsletter-error" className={cn(hint, hintErr)}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function SiteFooter() {
  const reduce = useReducedMotion();

  return (
    <motion.footer
      className="border-t border-[var(--stroke)] bg-paper-raised py-[var(--space-6)] pb-[var(--space-4)]"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: easeOut }}
    >
      <div className={wrap}>
        <div className="grid grid-cols-1 items-start gap-[var(--space-5)] wide:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.95fr)] wide:gap-x-[var(--space-6)] max-wide:gap-9">
          <div>
            <BrandLink size="lg" />
            <p className="mt-[var(--space-2)] max-w-[38ch] text-[1.05rem] leading-normal text-ink-70">
              A logbook for the days you showed up. One square at a time —
              no dashboards, no guilt, just the chain.
            </p>
          </div>

            <NewsletterSubscribe />
        </div>

        <div className="mt-[var(--space-5)] flex items-end justify-between gap-[var(--space-3)] border-t border-[var(--divider)] pt-[var(--space-4)] max-wide:flex-col max-wide:items-start max-wide:gap-4">
          <div className="flex gap-2" aria-hidden>
            {WEEK.map((cell, i) => (
              <div className="flex flex-col items-center gap-2" key={`${cell.day}-${i}`}>
                <motion.span
                  className={cn(
                    "block size-[26px] rounded-[3px] border border-ink-12 bg-l0 max-[640px]:size-[22px]",
                    SQ_LEVEL[cell.level],
                  )}
                  initial={reduce ? false : { scale: 0.5, opacity: 0 }}
                  whileInView={reduce ? undefined : { scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    ease: easeOut,
                    delay: reduce ? 0 : 0.04 * i,
                  }}
                />
                <span className={cn(mono, "text-[0.62rem] tracking-[0.14em] text-ink-50 uppercase")}>
                  {cell.day}
                </span>
              </div>
            ))}
          </div>
          <p
            className={cn(
              muted,
              mono,
              "m-0 grid min-w-0 gap-1 text-right text-[clamp(0.6rem,0.2rem+1.1vw,0.68rem)] leading-[1.45] tracking-[0.08em] uppercase max-wide:text-left max-wide:tracking-[0.06em] max-[640px]:[&_span]:whitespace-normal [&_span]:block [&_span]:whitespace-nowrap",
            )}
          >
            <span>This week, in squares.</span>
            <span>The last one is today.</span>
          </p>
        </div>

        <div
          className={cn(
            muted,
            mono,
            "mt-[var(--space-4)] flex items-center justify-between gap-[var(--space-2)] text-[0.65rem] tracking-[0.1em] uppercase max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-2 [&_p]:m-0",
          )}
        >
          <p>© {new Date().getFullYear()} Momentum — show up, mark the square.</p>
          <p>365 squares / year</p>
        </div>
      </div>
    </motion.footer>
  );
}

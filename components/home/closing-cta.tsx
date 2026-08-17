"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { BrandLink } from "@/components/home/brand-mark";
import { InkButton } from "@/components/home/ink-button";
import { MotionItem, MotionSection, easeOut } from "@/components/home/motion";

export function ClosingCta() {
  const reduce = useReducedMotion();

  return (
    <MotionSection className="section">
      <div className="wrap">
        <MotionItem
          className="cta-band"
          hoverLift
          style={{ boxShadow: "var(--shadow-lift)" }}
        >
          <motion.p
            className="eyebrow flame"
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
          <h2>
            The first square is the hard one.
          </h2>
          <p className="lede">
            After that, it’s just another day in the chain. Start a free logbook,
            or look around the demo first.
          </p>
          <motion.div
            className="row"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: easeOut, delay: 0.15 }}
          >
            <InkButton href="/register" variant="flame" size="lg">
              Create your account
            </InkButton>
            <InkButton href="#demo" variant="ghost" size="lg">
              Look around first
            </InkButton>
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
      <div className="footer-news">
        <p className="eyebrow">Subscribed</p>
        <p className="footer-news-lede">
          You’re on the list. We’ll write when it counts — no streaks, no spam.
        </p>
      </div>
    );
  }

  return (
    <div className="footer-news">
      <p className="eyebrow">Newsletter</p>
      <p className="footer-news-lede">
        A short note when the logbook changes. No streaks. No spam.
      </p>
      <form className="footer-news-form" onSubmit={onSubmit} noValidate>
        <label className="sr-only" htmlFor="footer-newsletter-email">
          Email
        </label>
        <input
          id="footer-newsletter-email"
          className="input"
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
        <button className="btn btn-flame btn-sm" type="submit">
          Subscribe
        </button>
      </form>
      {error ? (
        <span id="footer-newsletter-error" className="hint hint-err">
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
      className="footer"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: easeOut }}
    >
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <BrandLink size="lg" />
            <p className="footer-lede">
              A logbook for the days you showed up. One square at a time —
              no dashboards, no guilt, just the chain.
            </p>
          </div>

            <NewsletterSubscribe />
        </div>

        <div className="footer-week">
          <div className="footer-days" aria-hidden>
            {WEEK.map((cell, i) => (
              <div className="footer-day" key={`${cell.day}-${i}`}>
                <motion.span
                  className={`footer-sq ${cell.level}`}
                  initial={reduce ? false : { scale: 0.5, opacity: 0 }}
                  whileInView={reduce ? undefined : { scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    ease: easeOut,
                    delay: reduce ? 0 : 0.04 * i,
                  }}
                />
                <span className="footer-day-label mono">{cell.day}</span>
              </div>
            ))}
          </div>
          <p className="footer-week-cap muted mono">
            <span>This week, in squares.</span>
            <span>The last one is today.</span>
          </p>
        </div>

        <div className="footer-meta mono muted">
          <p>© {new Date().getFullYear()} Momentum — show up, mark the square.</p>
          <p>365 squares / year</p>
        </div>
      </div>
    </motion.footer>
  );
}

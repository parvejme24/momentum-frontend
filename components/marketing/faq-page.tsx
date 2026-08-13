"use client";

import Link from "next/link";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { ClosingCta, SiteFooter } from "@/components/home/closing-cta";
import { InkButton } from "@/components/home/ink-button";
import {
  fadeUpSoft,
  MotionItem,
  MotionSection,
  staggerContainer,
} from "@/components/home/motion";
import { SiteHeader } from "@/components/home/site-header";
import { FAQ_GROUPS } from "@/components/marketing/faq-data";

export function FaqPage() {
  const reduce = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <SiteHeader />
      <main>
        <motion.section
          className="section faq-hero"
          aria-labelledby="faq-title"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={reduce ? undefined : staggerContainer}
        >
          <div className="wrap">
            <motion.p
              className="eyebrow"
              variants={reduce ? undefined : fadeUpSoft}
            >
              Help
            </motion.p>
            <motion.h1
              id="faq-title"
              className="h-display"
              style={{ marginTop: 12, maxWidth: "16ch" }}
              variants={reduce ? undefined : fadeUpSoft}
            >
              Questions, answered calmly.
            </motion.h1>
            <motion.p
              className="lede faq-lede"
              variants={reduce ? undefined : fadeUpSoft}
            >
              Streaks, plans, export, and the year chain — short answers, no
              support-ticket theatre.
            </motion.p>

            <motion.nav
              className="faq-jump"
              aria-label="FAQ topics"
              variants={reduce ? undefined : fadeUpSoft}
            >
              {FAQ_GROUPS.map((group) => (
                <a key={group.id} href={`#${group.id}`} className="chip chip-quiet">
                  {group.title}
                </a>
              ))}
            </motion.nav>
          </div>
        </motion.section>

        {FAQ_GROUPS.map((group) => (
          <MotionSection
            key={group.id}
            id={group.id}
            className="section faq-group"
            aria-labelledby={`${group.id}-heading`}
          >
            <div className="wrap">
              <MotionItem>
                <p className="eyebrow">{group.title}</p>
                <h2 id={`${group.id}-heading`} style={{ marginTop: 12 }}>
                  {group.blurb}
                </h2>
              </MotionItem>

              <div className="faq-list">
                {group.items.map((item) => (
                  <MotionItem
                    key={item.q}
                    as="article"
                    className="card faq-item"
                    hoverLift
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    <h3 className="section-title">{item.q}</h3>
                    <p className="muted" style={{ marginTop: 10, lineHeight: 1.55 }}>
                      {item.a}
                    </p>
                  </MotionItem>
                ))}
              </div>
            </div>
          </MotionSection>
        ))}

        <section className="section faq-more">
          <div className="wrap">
            <div className="card faq-more-card">
              <div>
                <h2 className="section-title">Still unsure?</h2>
                <p className="hint" style={{ marginTop: 8, maxWidth: "42ch" }}>
                  Compare Free, Pro, and Team, or create an account and mark the
                  first square.
                </p>
              </div>
              <div className="faq-more-actions">
                <InkButton href="/pricing" variant="ghost">
                  See pricing
                </InkButton>
                <InkButton href="/register">Start free</InkButton>
              </div>
            </div>
            <p className="hint mono faq-footnote">
              Looking for billing in the app?{" "}
              <Link href="/subscription" className="pricing-inline-link">
                Subscription
              </Link>
              {" · "}
              <Link href="/login" className="pricing-inline-link">
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <ClosingCta />
      </main>
      <SiteFooter />
    </MotionConfig>
  );
}

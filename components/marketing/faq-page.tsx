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
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { FAQ_GROUPS } from "@/components/marketing/faq-data";
import { cn } from "@/lib/utils";
import {
  card,
  chip,
  chipQuiet,
  eyebrow,
  hDisplay,
  hint,
  lede,
  mono,
  section,
  sectionTitle,
  wrap,
} from "@/lib/ui";

const inlineLink =
  "text-blue-deep underline underline-offset-[3px] hover:text-ink";

export function FaqPage() {
  const reduce = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <SiteHeader />
      <main>
        <motion.section
          className={cn(section, "pt-section pb-[var(--space-4)]")}
          aria-labelledby="faq-title"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={reduce ? undefined : staggerContainer}
        >
          <div className={wrap}>
            <motion.p
              className={eyebrow}
              variants={reduce ? undefined : fadeUpSoft}
            >
              Help
            </motion.p>
            <motion.h1
              id="faq-title"
              className={cn(hDisplay, "mt-[var(--space-2)] max-w-[16ch]")}
              variants={reduce ? undefined : fadeUpSoft}
            >
              Questions, answered calmly.
            </motion.h1>
            <motion.p
              className={cn(lede, "mt-[var(--space-2)] max-w-[46ch]")}
              variants={reduce ? undefined : fadeUpSoft}
            >
              Streaks, plans, export, and the year chain — short answers, no
              support-ticket theatre.
            </motion.p>

            <motion.nav
              className="mt-[var(--space-3)] flex flex-wrap gap-[var(--space-1)]"
              aria-label="FAQ topics"
              variants={reduce ? undefined : fadeUpSoft}
            >
              {FAQ_GROUPS.map((group) => (
                <a
                  key={group.id}
                  href={`#${group.id}`}
                  className={cn(
                    chip,
                    chipQuiet,
                    "cursor-pointer no-underline hover:border-blue hover:bg-blue-soft hover:text-blue-deep",
                  )}
                >
                  {group.title}
                </a>
              ))}
            </motion.nav>
          </div>
        </motion.section>

        {FAQ_GROUPS.map((group, index) => (
          <MotionSection
            key={group.id}
            id={group.id}
            className={cn(
              section,
              "pt-[var(--space-5)] pb-[var(--space-4)] max-wide:pt-[var(--space-4)] max-wide:pb-[var(--space-3)]",
              index > 0 &&
                "border-t border-[var(--divider)] dark:border-[rgba(221,216,207,0.1)]",
            )}
            aria-labelledby={`${group.id}-heading`}
          >
            <div className={wrap}>
              <MotionItem className="mb-[var(--space-3)]">
                <p className={eyebrow}>{group.title}</p>
                <h2 id={`${group.id}-heading`} className="mt-[var(--space-2)] mb-0 max-w-[36ch]">
                  {group.blurb}
                </h2>
              </MotionItem>

              <FaqAccordion items={group.items} />
            </div>
          </MotionSection>
        ))}

        <section
          className={cn(
            section,
            "border-t border-[var(--divider)] pt-[var(--space-5)] pb-section max-wide:pt-[var(--space-4)] dark:border-[rgba(221,216,207,0.1)]",
          )}
        >
          <div className={wrap}>
            <div className={cn(card, "flex flex-wrap items-center justify-between gap-5 px-6 py-[22px]")}>
              <div>
                <h2 className={sectionTitle}>Still unsure?</h2>
                <p className={cn(hint, "mt-2 max-w-[42ch]")}>
                  Compare Free, Pro, and Team, or create an account and mark the
                  first square.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <InkButton href="/pricing" variant="ghost">
                  See pricing
                </InkButton>
                <InkButton href="/register">Start free</InkButton>
              </div>
            </div>
            <p className={cn(hint, mono, "mt-[var(--space-3)] text-center")}>
              Looking for billing in the app?{" "}
              <Link href="/subscription" className={inlineLink}>
                Subscription
              </Link>
              {" · "}
              <Link href="/login" className={inlineLink}>
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

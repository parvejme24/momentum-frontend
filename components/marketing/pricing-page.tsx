"use client";

import Link from "next/link";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { PlanFeatureList, CompareFeatureCell } from "@/components/billing/plan-feature-list";
import { ClosingCta, SiteFooter } from "@/components/home/closing-cta";
import { InkButton } from "@/components/home/ink-button";
import {
  fadeUpSoft,
  MotionItem,
  MotionSection,
  staggerContainer,
} from "@/components/home/motion";
import { SiteHeader } from "@/components/home/site-header";
import { PRICING_FAQ } from "@/components/marketing/faq-data";
import {
  PricingCompareSkeleton,
  PricingPlanGridSkeleton,
} from "@/components/marketing/pricing-skeletons";
import { QueryError } from "@/components/ui/query-error";
import { usePlanCompare, usePublicPlans } from "@/lib/billing/hooks";
import { planPricingCtaHref } from "@/lib/billing/checkout";
import { useAuth } from "@/lib/auth/context";
import { formatCents, intervalLabel } from "@/lib/money";
import { planFeaturesForDisplay } from "@/lib/pricing/features";
import { cn } from "@/lib/utils";
import {
  btn,
  btnBlock,
  btnGhost,
  btnSm,
  card,
  chip,
  chipFlame,
  chipQuiet,
  eyebrow,
  hDisplay,
  hint,
  lede,
  mono,
  muted,
  risoRule,
  rowBetween,
  section,
  sectionTitle,
  wrap,
} from "@/lib/ui";

const inlineLink =
  "text-blue-deep underline underline-offset-[3px] hover:text-ink";

const planCard =
  "m-0 flex h-full min-h-full flex-col gap-3.5 p-[22px] dark:bg-[linear-gradient(165deg,color-mix(in_srgb,var(--paper-white)_88%,var(--blue-soft)),var(--paper-raised))] dark:hover:shadow-lift dark:hover:shadow-glow";

export function PricingPage() {
  const reduce = useReducedMotion();
  const { user, isLoading: authLoading } = useAuth();
  const plansQuery = usePublicPlans();
  const compareQuery = usePlanCompare();
  const plans = plansQuery.data ?? [];
  const compare = compareQuery.data;
  const isLoggedIn = Boolean(user);

  return (
    <MotionConfig reducedMotion="user">
      <SiteHeader />
      <main>
        <motion.section
          className={cn(section, "pb-[var(--space-4)]")}
          aria-labelledby="pricing-title"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={reduce ? undefined : staggerContainer}
        >
          <div className={wrap}>
            <motion.p className={eyebrow} variants={reduce ? undefined : fadeUpSoft}>
              Pricing
            </motion.p>
            <motion.h1
              id="pricing-title"
              className={cn(hDisplay, "mt-[var(--space-2)] max-w-[14ch]")}
              variants={reduce ? undefined : fadeUpSoft}
            >
              One chain. Three plans.
            </motion.h1>
            <motion.p
              className={cn(lede, "mt-[var(--space-2)] max-w-[46ch]")}
              variants={reduce ? undefined : fadeUpSoft}
            >
              Start free, upgrade when the year grid matters. No surprise fees —
              just a renewal date you can read at a glance.
            </motion.p>
            <motion.p
              className={cn(hint, mono, "mt-[var(--space-2)] text-[0.72rem] tracking-[0.06em] uppercase")}
              variants={reduce ? undefined : fadeUpSoft}
            >
              14-day Pro trial on every new account · cancel anytime
            </motion.p>
          </div>
        </motion.section>

        <section className={cn(section, "pt-0")} aria-label="Plans">
          <div className={wrap}>
            {plansQuery.isLoading ? (
              <PricingPlanGridSkeleton />
            ) : (
              <>
                <QueryError error={plansQuery.error} fallback="Could not load plans" />

                <div className="grid grid-cols-1 items-stretch gap-[18px] wide:grid-cols-3">
                  {plans.map((plan, index) => (
                    <MotionItem
                      key={plan.id}
                      as="article"
                      className={cn(
                        card,
                        planCard,
                        plan.highlighted &&
                          "border-blue shadow-[var(--shadow-lift),var(--focus-ring)] dark:border-[#8ba4c9]/45 dark:shadow-[var(--shadow),var(--shadow-glow)]",
                      )}
                      hoverLift={!plan.highlighted}
                      initial={reduce ? false : { opacity: 0, y: 20 }}
                      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{
                        duration: 0.5,
                        delay: reduce ? 0 : index * 0.08,
                      }}
                    >
                      <div className="flex min-h-8 items-center justify-between gap-2.5">
                        <h2 className={sectionTitle}>{plan.name}</h2>
                        {plan.highlighted ? (
                          <span className={cn(chip, chipFlame)}>Popular</span>
                        ) : (
                          <span
                            className={cn(chip, chipQuiet, "invisible pointer-events-none")}
                            aria-hidden="true"
                          >
                            Popular
                          </span>
                        )}
                      </div>
                      <p className={cn(mono, "text-[clamp(1.8rem,4vw,2.4rem)] font-bold leading-none tracking-[-0.05em]")}>
                        {formatCents(plan.priceCents, plan.currency)}
                        <span className="ml-1 text-[0.82rem] font-semibold text-ink-50">
                          {intervalLabel(plan.interval, plan.intervalCount)}
                        </span>
                      </p>
                      <p className={cn(muted, "mt-2.5 text-[0.92rem]")}>
                        {plan.blurb}
                      </p>
                      <PlanFeatureList
                        features={planFeaturesForDisplay(plan, compare)}
                        className="m-0 flex flex-1 list-none flex-col gap-2 p-0 [&>li]:flex [&>li]:items-start [&>li]:gap-2 [&>li]:text-[0.88rem] [&>li]:leading-[1.45] [&>li]:text-ink-70"
                      />
                      <InkButton
                        href={
                          authLoading
                            ? plan.ctaHref || "/register"
                            : planPricingCtaHref(plan, isLoggedIn)
                        }
                        variant={plan.highlighted ? "primary" : "ghost"}
                        className={cn(btnBlock, "mt-auto")}
                        size="md"
                      >
                        {plan.ctaLabel || "Get started"}
                      </InkButton>
                    </MotionItem>
                  ))}
                </div>

                {!plansQuery.error && plans.length === 0 ? (
                  <p className={hint}>No published plans yet.</p>
                ) : null}
              </>
            )}

            <p className={cn(hint, "mt-[var(--space-3)] mb-[var(--space-5)] text-center", mono)}>
              Already tracking?{" "}
              <Link href="/login" className={inlineLink}>
                Sign in
              </Link>{" "}
              to manage your plan, or open{" "}
              <Link href="/subscription" className={inlineLink}>
                Subscription
              </Link>{" "}
              in the app.
            </p>
          </div>
        </section>

        <hr className={cn(risoRule, wrap)} />

        <MotionSection className={section} aria-labelledby="compare-heading">
          <div className={wrap}>
            <MotionItem>
              <p className={eyebrow}>Compare</p>
              <h2 id="compare-heading" className="mt-[var(--space-2)]">
                What each plan unlocks
              </h2>
            </MotionItem>

            {compareQuery.isLoading ? (
              <PricingCompareSkeleton />
            ) : (
              <>
                <QueryError
                  error={compareQuery.error}
                  fallback="Could not load plan comparison"
                />

                {compare?.plans.length && compare.features.length ? (
                  <div
                    className={cn(
                      card,
                      "mt-[var(--space-4)] overflow-hidden p-0 animate-rise motion-reduce:animate-none",
                    )}
                  >
                    <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                      <table className="w-full min-w-[520px] border-collapse">
                        <thead>
                          <tr>
                            <th
                              scope="col"
                              className="border-b border-[var(--divider)] bg-[color-mix(in_srgb,var(--paper-white)_80%,var(--rule))] px-[18px] py-3.5 text-left font-mono text-[0.66rem] font-semibold tracking-[0.12em] text-ink-50 uppercase [&:nth-child(3)]:bg-blue-soft"
                            >
                              Feature
                            </th>
                            {compare.plans.map((plan) => (
                              <th
                                key={plan.slug}
                                scope="col"
                                className="border-b border-[var(--divider)] bg-[color-mix(in_srgb,var(--paper-white)_80%,var(--rule))] px-[18px] py-3.5 text-left font-mono text-[0.66rem] font-semibold tracking-[0.12em] text-ink-50 uppercase [&:nth-child(3)]:bg-blue-soft"
                              >
                                {plan.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {compare.features.map((row) => (
                            <tr key={row.key} className="last:[&>td]:border-b-0 last:[&>th]:border-b-0">
                              <th
                                scope="row"
                                className="border-b border-[var(--divider)] px-[18px] py-3.5 text-left text-[0.88rem] font-semibold text-ink"
                              >
                                {row.label}
                              </th>
                              {compare.plans.map((plan) => (
                                <td
                                  key={plan.slug}
                                  className={cn(
                                    mono,
                                    "border-b border-[var(--divider)] px-[18px] py-3.5 text-left text-[0.88rem] [&:nth-child(3)]:bg-blue-soft",
                                  )}
                                >
                                  <CompareFeatureCell feature={row.values[plan.slug]} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : !compareQuery.error ? (
                  <p className={hint}>Comparison table is not available yet.</p>
                ) : null}
              </>
            )}
          </div>
        </MotionSection>

        <MotionSection
          id="faq"
          className={section}
          aria-labelledby="faq-heading"
        >
          <div className={wrap}>
            <MotionItem>
              <div className={cn(rowBetween, "items-end")}>
                <div>
                  <p className={eyebrow}>FAQ</p>
                  <h2 id="faq-heading" className="mt-[var(--space-2)]">
                    Common questions
                  </h2>
                </div>
                <Link href="/faq" className={cn(btn, btnGhost, btnSm)}>
                  All FAQ
                </Link>
              </div>
            </MotionItem>

            <div className="mt-7 grid grid-cols-1 items-stretch gap-4 wide:grid-cols-2">
              {PRICING_FAQ.slice(0, 4).map((item) => (
                <MotionItem
                  key={item.q}
                  as="article"
                  className={cn(card, "m-0 flex h-full flex-col p-[18px]")}
                  hoverLift
                >
                  <h3 className={cn(sectionTitle, "mb-0 leading-[1.25]")}>{item.q}</h3>
                  <p className={cn(muted, "mt-2.5 mb-0 text-[0.92rem] leading-normal")}>
                    {item.a}
                  </p>
                </MotionItem>
              ))}
            </div>
          </div>
        </MotionSection>

        <ClosingCta />
      </main>
      <SiteFooter />
    </MotionConfig>
  );
}

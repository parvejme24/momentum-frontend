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
          className="section pricing-hero"
          aria-labelledby="pricing-title"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={reduce ? undefined : staggerContainer}
        >
          <div className="wrap">
            <motion.p className="eyebrow" variants={reduce ? undefined : fadeUpSoft}>
              Pricing
            </motion.p>
            <motion.h1
              id="pricing-title"
              className="h-display"
              style={{ maxWidth: "14ch" }}
              variants={reduce ? undefined : fadeUpSoft}
            >
              One chain. Three plans.
            </motion.h1>
            <motion.p
              className="lede pricing-lede"
              variants={reduce ? undefined : fadeUpSoft}
            >
              Start free, upgrade when the year grid matters. No surprise fees —
              just a renewal date you can read at a glance.
            </motion.p>
            <motion.p
              className="hint mono pricing-note"
              variants={reduce ? undefined : fadeUpSoft}
            >
              14-day Pro trial on every new account · cancel anytime
            </motion.p>
          </div>
        </motion.section>

        <section className="section pricing-plans-section" aria-label="Plans">
          <div className="wrap">
            {plansQuery.isLoading ? (
              <PricingPlanGridSkeleton />
            ) : (
              <>
                <QueryError error={plansQuery.error} fallback="Could not load plans" />

                <div className="pricing-plan-grid">
                  {plans.map((plan, index) => (
                    <MotionItem
                      key={plan.id}
                      as="article"
                      className={
                        plan.highlighted
                          ? "card pricing-plan-card featured"
                          : "card pricing-plan-card"
                      }
                      hoverLift={!plan.highlighted}
                      style={
                        plan.highlighted
                          ? { boxShadow: "var(--shadow-lift)" }
                          : { boxShadow: "var(--shadow-sm)" }
                      }
                      initial={reduce ? false : { opacity: 0, y: 20 }}
                      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{
                        duration: 0.5,
                        delay: reduce ? 0 : index * 0.08,
                      }}
                    >
                      <div className="pricing-plan-top">
                        <h2 className="section-title">{plan.name}</h2>
                        {plan.highlighted ? (
                          <span className="chip chip-flame">Popular</span>
                        ) : null}
                      </div>
                      <p className="pricing-plan-price mono">
                        {formatCents(plan.priceCents, plan.currency)}
                        <span className="subscription-period">
                          {intervalLabel(plan.interval, plan.intervalCount)}
                        </span>
                      </p>
                      <p className="muted" style={{ marginTop: 10, fontSize: "0.92rem" }}>
                        {plan.blurb}
                      </p>
                      <PlanFeatureList
                        features={planFeaturesForDisplay(plan, compare)}
                      />
                      <InkButton
                        href={
                          authLoading
                            ? plan.ctaHref || "/register"
                            : planPricingCtaHref(plan, isLoggedIn)
                        }
                        variant={plan.highlighted ? "primary" : "ghost"}
                        className="btn-block"
                        size={plan.highlighted ? "lg" : "md"}
                      >
                        {plan.ctaLabel || "Get started"}
                      </InkButton>
                    </MotionItem>
                  ))}
                </div>

                {!plansQuery.error && plans.length === 0 ? (
                  <p className="hint">No published plans yet.</p>
                ) : null}
              </>
            )}

            <p className="hint pricing-footnote mono">
              Already tracking?{" "}
              <Link href="/login" className="pricing-inline-link">
                Sign in
              </Link>{" "}
              to manage your plan, or open{" "}
              <Link href="/subscription" className="pricing-inline-link">
                Subscription
              </Link>{" "}
              in the app.
            </p>
          </div>
        </section>

        <hr className="riso-rule wrap" />

        <MotionSection className="section pricing-compare" aria-labelledby="compare-heading">
          <div className="wrap">
            <MotionItem>
              <p className="eyebrow">Compare</p>
              <h2 id="compare-heading">
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
                  <div className="card pricing-table-card pricing-compare-content">
                    <div className="pricing-table-scroll">
                      <table className="pricing-table">
                        <thead>
                          <tr>
                            <th scope="col">Feature</th>
                            {compare.plans.map((plan) => (
                              <th key={plan.slug} scope="col">
                                {plan.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {compare.features.map((row) => (
                            <tr key={row.key}>
                              <th scope="row">{row.label}</th>
                              {compare.plans.map((plan) => (
                                <td key={plan.slug} className="mono">
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
                  <p className="hint">Comparison table is not available yet.</p>
                ) : null}
              </>
            )}
          </div>
        </MotionSection>

        <MotionSection
          id="faq"
          className="section pricing-faq"
          aria-labelledby="faq-heading"
        >
          <div className="wrap">
            <MotionItem>
              <div className="row-between" style={{ alignItems: "flex-end" }}>
                <div>
                  <p className="eyebrow">FAQ</p>
                  <h2 id="faq-heading">
                    Common questions
                  </h2>
                </div>
                <Link href="/faq" className="btn btn-ghost btn-sm">
                  All FAQ
                </Link>
              </div>
            </MotionItem>

            <div className="pricing-faq-list">
              {PRICING_FAQ.slice(0, 4).map((item) => (
                <MotionItem
                  key={item.q}
                  as="article"
                  className="card pricing-faq-item"
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

        <ClosingCta />
      </main>
      <SiteFooter />
    </MotionConfig>
  );
}

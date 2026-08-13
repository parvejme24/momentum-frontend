"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { PLANS } from "@/components/billing/subscription-data";
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

export function PricingPage() {
  const reduce = useReducedMotion();

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
              style={{ marginTop: 12, maxWidth: "14ch" }}
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
            <div className="pricing-plan-grid">
              {PLANS.map((plan, index) => (
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
                    {plan.price}
                    <span className="subscription-period">{plan.period}</span>
                  </p>
                  <p className="muted" style={{ marginTop: 10, fontSize: "0.92rem" }}>
                    {plan.blurb}
                  </p>
                  <ul className="subscription-features">
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <Check size={15} strokeWidth={2.6} aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <InkButton
                    href={plan.publicCta?.href ?? "/register"}
                    variant={plan.publicCta?.variant ?? "primary"}
                    className="btn-block"
                    size={plan.highlighted ? "lg" : "md"}
                  >
                    {plan.publicCta?.label ?? "Get started"}
                  </InkButton>
                </MotionItem>
              ))}
            </div>

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
              <h2 id="compare-heading" style={{ marginTop: 12 }}>
                What each plan unlocks
              </h2>
            </MotionItem>

            <MotionItem className="card pricing-table-card" style={{ marginTop: 28 }}>
              <div className="pricing-table-scroll">
                <table className="pricing-table">
                  <thead>
                    <tr>
                      <th scope="col">Feature</th>
                      <th scope="col">Free</th>
                      <th scope="col">Pro</th>
                      <th scope="col">Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Active habits", "3", "Unlimited", "Unlimited"],
                      ["Heatmap window", "90 days", "364 days", "364 days"],
                      ["Stats & weekday insight", "—", "✓", "✓"],
                      ["Reminders", "1 device", "All devices", "All devices"],
                      ["Export", "CSV", "CSV + JSON", "CSV + JSON"],
                      ["Shared boards", "—", "—", "✓"],
                      ["Admin seats", "—", "—", "✓"],
                    ].map(([feature, free, pro, team]) => (
                      <tr key={feature}>
                        <th scope="row">{feature}</th>
                        <td className="mono">{free}</td>
                        <td className="mono">{pro}</td>
                        <td className="mono">{team}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </MotionItem>
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
                  <h2 id="faq-heading" style={{ marginTop: 12 }}>
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

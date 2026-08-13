"use client";

import { MotionConfig } from "framer-motion";

import { ClosingCta, SiteFooter } from "@/components/home/closing-cta";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { SiteHeader } from "@/components/home/site-header";
import { StreakRules } from "@/components/home/streak-rules";

export function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <SiteHeader />
      <main>
        <Hero />
        <hr className="riso-rule wrap" />
        <HowItWorks />
        <Features />
        <hr className="riso-rule wrap" />
        <StreakRules />
        <ClosingCta />
      </main>
      <SiteFooter />
    </MotionConfig>
  );
}

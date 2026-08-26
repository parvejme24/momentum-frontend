"use client";

import { MotionConfig } from "framer-motion";

import { ClosingCta, SiteFooter } from "@/components/home/closing-cta";
import { DemoScrollOnLoad } from "@/components/home/demo-link";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { SiteHeader } from "@/components/home/site-header";
import { StreakRules } from "@/components/home/streak-rules";
import { cn } from "@/lib/utils";
import { risoRule, wrap } from "@/lib/ui";

export function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <DemoScrollOnLoad />
      <SiteHeader />
      <main>
        <Hero />
        <hr className={cn(risoRule, wrap)} />
        <HowItWorks />
        <Features />
        <StreakRules />
        <ClosingCta />
      </main>
      <SiteFooter />
    </MotionConfig>
  );
}

"use client";

import { MotionConfig } from "framer-motion";

import { BrandLink } from "@/components/home/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { mono } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function CheckoutShell({
  children,
  art,
}: {
  children: React.ReactNode;
  art: {
    eyebrow: string;
    title: string;
    body: string;
    price: string;
    period: string;
    footer?: React.ReactNode;
  };
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative grid min-h-screen grid-cols-1 bg-paper max-wide:grid-cols-1 wide:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="absolute top-[18px] right-[18px] z-30">
          <ThemeToggle />
        </div>

        <aside
          className="flex flex-col justify-between gap-7 border-r border-[var(--stroke)] bg-[linear-gradient(165deg,color-mix(in_srgb,var(--blue-soft)_88%,var(--paper))_0%,var(--paper-raised)_55%,var(--paper)_100%)] p-[clamp(24px,4vw,48px)] max-wide:border-r-0 max-wide:border-b dark:bg-[linear-gradient(165deg,color-mix(in_srgb,var(--blue-soft)_40%,var(--paper))_0%,var(--paper-raised)_100%)]"
          aria-label="Order summary"
        >
          <BrandLink size="sm" className="text-ink" />
          <div>
            <p className="mt-7 mb-0 font-mono text-[0.68rem] font-semibold tracking-[0.14em] uppercase text-blue">
              {art.eyebrow}
            </p>
            <h1 className="mt-2.5 mb-0 font-heading text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">
              {art.title}
            </h1>
            <p className="mt-3 mb-0 max-w-[36ch] leading-[1.55] text-ink-70">
              {art.body}
            </p>
            <p
              className={cn(
                mono,
                "mt-[22px] mb-0 text-[clamp(1.8rem,4vw,2.5rem)] font-bold leading-none tracking-[-0.05em]",
              )}
            >
              {art.price}
              <span className="ml-2 text-[0.92rem] font-semibold text-ink-50">
                {art.period}
              </span>
            </p>
          </div>
          {art.footer ? <div className="mt-auto">{art.footer}</div> : null}
        </aside>

        <main className="flex items-center justify-center p-[clamp(20px,4vw,40px)] max-wide:items-start dark:bg-paper">
          <div className="w-[min(100%,520px)]">{children}</div>
        </main>
      </div>
    </MotionConfig>
  );
}

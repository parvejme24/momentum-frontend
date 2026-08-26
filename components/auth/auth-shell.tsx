"use client";

import { MotionConfig } from "framer-motion";

import { AuthArtPanel } from "@/components/auth/auth-art";
import { BrandLink } from "@/components/home/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { mono } from "@/lib/ui";

export const riseAuth =
  "[&>*]:translate-y-4 [&>*]:animate-rise [&>*]:opacity-0 [&>*:nth-child(1)]:delay-[50ms] [&>*:nth-child(2)]:delay-[130ms] [&>*:nth-child(3)]:delay-[210ms] [&>*:nth-child(4)]:delay-[290ms] [&>*:nth-child(5)]:delay-[370ms] [&>*:nth-child(6)]:delay-[450ms] motion-reduce:[&>*]:translate-y-0 motion-reduce:[&>*]:animate-none motion-reduce:[&>*]:opacity-100";

export function AuthShell({
  children,
  art,
}: {
  children: React.ReactNode;
  art: {
    headline: string;
    body: string;
    footer: React.ReactNode;
  };
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative grid min-h-svh grid-cols-2 max-nav:grid-cols-1">
        <div className="absolute top-[18px] right-[18px] z-30">
          <ThemeToggle />
        </div>
        <AuthArtPanel
          headline={art.headline}
          body={art.body}
          footer={art.footer}
        />

        <div
          className={cn(
            "relative grid w-full min-w-0 place-items-center bg-auth-form bg-[size:24px_24px] bg-[position:-1px_-1px] px-[clamp(var(--space-2),4vw,var(--space-4))] pt-[var(--space-5)] pb-[var(--space-6)] transition-colors duration-normal ease-smooth",
            "bg-[image:linear-gradient(var(--auth-form-grid)_1px,transparent_1px),linear-gradient(90deg,var(--auth-form-grid)_1px,transparent_1px)]",
            "max-nav:px-[var(--space-2)] max-nav:pt-[72px]",
            "dark:bg-[image:radial-gradient(90%_70%_at_100%_0%,color-mix(in_srgb,var(--blue-soft)_50%,transparent),transparent_55%),radial-gradient(70%_55%_at_0%_100%,color-mix(in_srgb,var(--flame-soft)_65%,transparent),transparent_50%),linear-gradient(var(--auth-form-grid)_1px,transparent_1px),linear-gradient(90deg,var(--auth-form-grid)_1px,transparent_1px)]",
          )}
        >
          <div className="absolute top-[18px] left-[18px] hidden items-center max-nav:flex">
            <BrandLink size="sm" className="hidden max-nav:inline-flex" />
          </div>

          <div
            className={cn(
              "mx-auto flex w-full max-w-[var(--auth-form-max)] flex-col gap-[18px] p-0 max-nav:max-w-full",
              riseAuth,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

export const authBrandDesktop = "block max-nav:hidden";

export const authHeading =
  "[&_h1]:m-0 [&_h1]:text-[clamp(1.7rem,3vw,2.1rem)]";

export const authFields = "grid gap-4";

export const authAlert =
  "rounded-md border border-[var(--stroke)] bg-flame-soft px-3.5 py-3 text-[0.9rem] font-semibold text-danger-ink dark:border-[rgba(201,122,106,0.35)] dark:bg-[color-mix(in_srgb,#c97a6a_16%,var(--paper-raised))] dark:text-[#e8a598]";

export const authSuccess =
  "m-0 flex items-center gap-2.5 rounded-md border border-[var(--stroke)] bg-blue-soft px-3.5 py-3 text-[0.9rem] font-semibold text-blue-deep dark:border-[rgba(139,164,201,0.32)] dark:bg-[color-mix(in_srgb,var(--blue-soft)_70%,var(--paper-raised))]";

export const authFoot = cn(
  mono,
  "text-center text-[0.78rem] tracking-[0.04em] text-ink-50",
);

export const authFootLink =
  "cursor-pointer font-bold text-blue hover:text-ink dark:hover:text-blue-deep";

export const authInlineLink = cn(
  mono,
  "cursor-pointer text-[0.68rem] font-semibold tracking-[0.08em] text-blue uppercase hover:text-ink dark:hover:text-blue-deep",
);

export const authDivider = cn(
  mono,
  "flex items-center gap-3.5 text-[0.72rem] tracking-[0.12em] text-ink-30 uppercase before:h-0.5 before:flex-1 before:bg-ink-12 before:content-[''] after:h-0.5 after:flex-1 after:bg-ink-12 after:content-[''] dark:text-ink-50 dark:before:bg-[rgba(221,216,207,0.1)] dark:after:bg-[rgba(221,216,207,0.1)]",
);

export const authChecklist =
  "m-0 grid list-none gap-2.5 p-0 text-[0.88rem] tracking-normal text-[var(--auth-art-muted)] normal-case [&>li]:flex [&>li]:items-start [&>li]:gap-2.5 [&>li]:before:mt-[5px] [&>li]:before:size-2.5 [&>li]:before:shrink-0 [&>li]:before:border-[1.5px] [&>li]:before:border-[var(--auth-art-fg)] [&>li]:before:bg-blue [&>li]:before:content-[''] dark:[&>li]:before:border-[#8ba4c9]/40";

export function AuthFormItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

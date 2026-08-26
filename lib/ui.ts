import { cn } from "@/lib/utils";

export const eyebrow =
  "font-mono text-[0.7rem] font-semibold tracking-[0.16em] uppercase text-blue";

export const lede =
  "max-w-[60ch] text-[clamp(1rem,1.6vw,1.18rem)] text-ink-70";

export const muted = "text-ink-50";

export const mono = "font-mono tabular-nums";

export const num = "font-mono font-bold tabular-nums tracking-[-0.04em]";

export const hDisplay = "text-[clamp(2.75rem,9vw,6.5rem)]";

export const sectionTitle = "m-0 text-[1.15rem]";

export const wrap = "mx-auto w-[min(1200px,calc(100%-48px))]";

export const wrapNarrow = "mx-auto w-[min(760px,calc(100%-48px))]";

export const section = "pt-section pb-0 last:pb-section";

export const row = "flex items-center gap-4";

export const rowBetween = "flex flex-wrap items-center justify-between gap-4";

export const stackSm = "*:not-first:mt-2";

export const stack = "*:not-first:mt-4";

export const stackLg = "*:not-first:mt-8";

export const btn =
  "inline-flex cursor-pointer items-center justify-center gap-[9px] whitespace-nowrap rounded-md border border-ink/9 bg-paper-white px-[22px] py-3 font-sans text-[0.94rem] font-semibold text-ink shadow-paper-sm transition-[transform,box-shadow,background,border-color,color,opacity] duration-normal ease-smooth hover:-translate-y-0.5 hover:shadow-hover active:translate-y-0 active:shadow-press active:duration-instant disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-paper-sm disabled:hover:translate-y-0 dark:border-ink/14 dark:hover:shadow-paper";

export const btnPrimary =
  "border-blue/35 bg-linear-to-br from-blue to-blue-deep text-solid-white hover:from-blue-deep hover:to-blue hover:text-solid-white dark:border-[#8ba4c9]/40 dark:from-[#6d8cb0] dark:to-[#8ba4c9] dark:text-[#0f1117] dark:hover:from-[#8ba4c9] dark:hover:to-[#a8bdd8]";

export const btnFlame =
  "bg-linear-to-br from-flame to-[#e84a28] text-solid-white";

export const btnGhost =
  "border-ink/12 bg-paper-white text-ink shadow-paper-sm hover:border-ink/16 hover:bg-paper-white hover:shadow-hover dark:bg-paper-white/70";

export const btnLg = "px-[30px] py-[15px] text-[1.02rem]";

export const btnSm = "px-3.5 py-2 text-[0.84rem] shadow-paper-sm";

export const btnBlock = "w-full";

export const btnDanger =
  "border-flame bg-flame-soft text-danger-ink";

export const btnIcon =
  "inline-flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-md border border-ink/9 bg-paper-white p-0 shadow-paper-sm transition-[transform,box-shadow] duration-normal ease-smooth hover:-translate-y-0.5 hover:shadow-hover dark:border-ink/12 dark:bg-paper-raised/88 dark:hover:border-[#8ba4c9]/35 dark:hover:bg-paper-white";

export const card =
  "rounded-lg border border-ink/9 bg-linear-to-br from-paper-white/88 to-paper-raised p-6 shadow-paper-sm transition-[transform,box-shadow] duration-normal ease-smooth dark:from-paper-white/92 dark:via-paper-raised dark:to-paper-raised";

export const cardFlat = "shadow-none";

export const cardHover =
  "transition-[transform,box-shadow] duration-normal ease-smooth hover:-translate-y-[3px] hover:shadow-lift dark:hover:shadow-lift dark:hover:shadow-glow";

export const panelHead =
  "mb-[18px] flex flex-wrap items-center justify-between gap-4 border-b border-ink/8 pb-3.5";

export const chip =
  "inline-flex items-center gap-1.5 rounded-full border border-ink/12 bg-paper-white px-2.5 py-1 font-mono text-[0.68rem] font-semibold tracking-[0.07em] uppercase dark:border-ink/14 dark:bg-paper-white/80";

export const chipBlue =
  "border-blue bg-blue-soft text-blue-deep dark:border-[#8ba4c9]/35 dark:bg-blue-soft/85";

export const chipFlame =
  "border-flame bg-flame-soft text-danger-ink dark:border-[#d4a574]/35 dark:text-flame";

export const chipQuiet =
  "border-ink-30 text-ink-50 dark:border-ink/10";

export const tabBar = "flex flex-wrap gap-1.5";

export const tab =
  "cursor-pointer rounded-full border border-ink/10 bg-l0 px-4 py-2 text-[0.88rem] font-semibold text-ink-50 transition-[background,border-color,color,transform] duration-normal ease-smooth hover:-translate-y-px hover:border-ink-12 hover:bg-paper-white hover:text-ink dark:border-ink/8 dark:bg-paper-white/50 dark:hover:border-[#8ba4c9]/22 dark:hover:bg-paper-white/75 dark:hover:text-ink-70";

export const tabActive =
  "border-ink bg-ink text-paper hover:translate-y-0 hover:border-ink hover:bg-ink hover:text-paper dark:border-[#8ba4c9]/62 dark:bg-linear-to-br dark:from-[color-mix(in_srgb,var(--blue)_42%,var(--paper-white))] dark:to-[color-mix(in_srgb,var(--blue-soft)_90%,var(--paper-white))] dark:text-solid-white dark:hover:text-solid-white";

export const field = "block not-first:mt-[18px]";

export const label =
  "mb-[7px] block font-mono text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-ink-70";

export const labelReq =
  "ml-[0.25em] inline align-baseline font-mono text-[0.85rem] font-bold leading-none text-flame";

export const fieldControl =
  "h-11.5 w-full min-w-0 rounded-xl border border-ink/8 bg-paper-white px-3.5 py-3 text-[0.94rem] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground hover:border-ink/12 focus:border-blue/28 focus:shadow-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-55 dark:border-ink/10 dark:hover:border-ink/16 dark:focus:border-[#8ba4c9]/40";

export const input = fieldControl;

export const textarea = cn(fieldControl, "h-auto min-h-28 resize-y");

export const dialogBtn = cn(btn, "min-h-11.5 min-w-30 rounded-xl px-6");

export const select = cn(
  input,
  "cursor-pointer appearance-none bg-size-[7px_7px,7px_7px] bg-position-[calc(100%-20px)_calc(50%-2px),calc(100%-14px)_calc(50%-2px)] bg-no-repeat pr-[38px]",
  "bg-[linear-gradient(45deg,transparent_50%,var(--ink)_50%),linear-gradient(-45deg,var(--ink)_50%,transparent_50%)]",
);

export const inlineLink =
  "cursor-pointer text-[0.68rem] font-semibold tracking-[0.08em] uppercase text-blue hover:text-ink dark:hover:text-blue-deep";

export const hint = "mt-1.5 text-[0.8rem] text-ink-50";

export const hintErr = "font-semibold text-danger dark:text-[#c97a6a]";

export const pageHead = "mb-8 [&_h1]:mb-1.5 [&>.font-mono]:mb-2";

export const backLink =
  "mb-[18px] inline-block cursor-pointer text-[0.72rem] font-semibold tracking-[0.06em] uppercase text-ink-50 hover:text-ink";

export const settingsActions = "flex flex-wrap gap-2.5";

export const fieldRow =
  "grid grid-cols-1 items-start gap-3.5 min-[901px]:grid-cols-2 [&>*]:m-0 [&>*]:flex [&>*]:min-w-0 [&>*]:flex-col [&>*]:gap-[7px]";

export const risoRule =
  "my-0 h-[5px] border-0 bg-[linear-gradient(to_bottom,var(--flame)_0_2px,transparent_2px_3px,var(--blue)_3px_5px)]";

export const avatar =
  "grid size-[38px] shrink-0 place-items-center rounded-md border border-ink/9 bg-flame font-heading font-extrabold text-white";

export const stat =
  "rounded-lg border border-ink/9 bg-paper-raised p-5 shadow-paper-sm";

export const statK =
  "font-mono text-[0.66rem] font-semibold tracking-[0.13em] uppercase text-ink-50";

export const statV =
  "mt-1.5 font-mono text-[clamp(1.7rem,4vw,2.3rem)] font-bold leading-none tracking-[-0.05em]";

export const statN = "mt-1.5 text-[0.8rem] text-ink-50";

export const skeleton =
  "rounded-md bg-[linear-gradient(90deg,var(--ink-12)_0%,color-mix(in_srgb,var(--paper-white)_88%,var(--ink-12))_50%,var(--ink-12)_100%)] bg-size-[200%_100%] animate-skeleton-shimmer motion-reduce:animate-none";

export function tabs(active: boolean) {
  return cn(tab, active && tabActive);
}

export function buttons(
  variant: "primary" | "ghost" | "flame" | "danger" | "icon" = "primary",
  size: "md" | "lg" | "sm" | "block" | "icon" = "md",
  extra?: string,
) {
  if (variant === "icon" || size === "icon") {
    return cn(btnIcon, extra);
  }
  return cn(
    btn,
    variant === "primary" && btnPrimary,
    variant === "ghost" && btnGhost,
    variant === "flame" && btnFlame,
    variant === "danger" && btnDanger,
    size === "lg" && btnLg,
    size === "sm" && btnSm,
    size === "block" && btnBlock,
    extra,
  );
}

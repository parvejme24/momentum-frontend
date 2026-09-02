"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronUp } from "lucide-react";

import {
  isNavActive,
  isTabNavActive,
  type TabNavItem,
} from "@/lib/app/navigation";
import { navPrefetchHandlers, prefetchAppRoute } from "@/lib/app/prefetch";
import { mono } from "@/lib/ui";
import { cn } from "@/lib/utils";

const TAB_LINK =
  "grid min-h-[54px] w-full cursor-pointer content-center justify-items-center gap-1 rounded-lg border-2 border-transparent bg-transparent px-1 py-2 text-[0.62rem] font-bold tracking-[0.02em] text-ink-50 transition-[background,border-color,color,transform] duration-normal ease-smooth focus-visible:text-blue focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none [&>svg]:size-5 [&>svg]:stroke-current";

const TAB_LINK_CURRENT =
  "bg-[linear-gradient(160deg,color-mix(in_srgb,var(--blue-soft)_85%,transparent),color-mix(in_srgb,var(--flame-soft)_40%,transparent))] text-blue-deep shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--blue)_32%,transparent)] dark:shadow-[inset_0_0_0_1px_rgba(139,164,201,0.35)]";

const MENU_LINK =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border-2 border-transparent bg-transparent px-3.5 py-2.5 text-[0.92rem] font-semibold text-ink-70 shadow-none transition-[background,border-color,color] duration-normal ease-smooth hover:bg-[color-mix(in_srgb,var(--paper-white)_88%,var(--blue-soft))] hover:text-ink focus-visible:text-blue focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none dark:hover:bg-[color-mix(in_srgb,var(--paper-white)_75%,var(--blue-soft))] [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:stroke-current";

const MENU_LINK_CURRENT =
  "bg-[linear-gradient(120deg,color-mix(in_srgb,var(--blue-soft)_80%,transparent),color-mix(in_srgb,var(--flame-soft)_35%,transparent))] text-blue-deep shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--blue)_32%,transparent)] dark:bg-[linear-gradient(120deg,color-mix(in_srgb,var(--blue-soft)_90%,transparent),color-mix(in_srgb,var(--flame-soft)_50%,transparent))] dark:shadow-[inset_0_0_0_1px_rgba(139,164,201,0.35)]";

function isModifiedClick(event: React.MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

export function MobileTabNav({
  items,
  pathname,
  onNavigate,
}: {
  items: TabNavItem[];
  pathname: string;
  onNavigate: (href: string) => void;
}) {
  const queryClient = useQueryClient();
  const panelId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  const openItem = items.find((item) => item.id === openId && item.children?.length);

  useEffect(() => {
    setOpenId(null);
  }, [pathname]);

  useEffect(() => {
    if (!openId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  function markPending(href: string) {
    return (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (isModifiedClick(event)) return;
      setOpenId(null);
      onNavigate(href);
    };
  }

  function toggleMenu(item: TabNavItem) {
    const next = openId === item.id ? null : item.id;
    setOpenId(next);
    if (next && item.children) {
      for (const child of item.children) {
        void prefetchAppRoute(queryClient, child.href);
      }
    }
  }

  return (
    <>
      {openItem ? (
        <button
          type="button"
          className="fixed inset-0 z-[65] hidden cursor-default bg-[rgba(20,26,46,0.35)] backdrop-blur-[2px] max-nav:block"
          aria-label="Close menu"
          onClick={() => setOpenId(null)}
        />
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-[70] hidden border-t border-[var(--stroke)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--paper-raised)_88%,transparent),var(--paper-raised))] px-2.5 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] backdrop-blur-[10px] max-nav:block dark:border-[rgba(221,216,207,0.08)] dark:bg-[color-mix(in_srgb,var(--paper-raised)_94%,transparent)] dark:backdrop-blur-[14px]"
        aria-label="Mobile"
      >
        {openItem?.children ? (
          <div
            id={panelId}
            role="menu"
            aria-label={openItem.childrenLabel ?? openItem.label}
            className="absolute inset-x-0 bottom-full mb-0 rounded-t-2xl border border-b-0 border-[var(--stroke)] bg-paper-raised px-3 pt-3.5 pb-3 shadow-lift animate-sheet-in motion-reduce:animate-none dark:border-[rgba(221,216,207,0.08)]"
          >
            <p
              className={cn(
                mono,
                "m-0 mb-2.5 px-3.5 text-[0.68rem] tracking-[0.12em] uppercase text-ink-50",
              )}
            >
              {openItem.childrenLabel ?? openItem.label}
            </p>
            <ul
              className={cn(
                "m-0 grid list-none gap-1 p-0",
                openItem.children.length > 4 && "min-[640px]:grid-cols-2",
              )}
            >
              {openItem.children.map((child) => {
                const Icon = child.icon;
                const active = isNavActive(pathname, child.href, "tab");
                return (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      prefetch={false}
                      role="menuitem"
                      className={cn(MENU_LINK, active && MENU_LINK_CURRENT)}
                      aria-current={active ? "page" : undefined}
                      onClick={markPending(child.href)}
                      {...navPrefetchHandlers(queryClient, child.href)}
                    >
                      <Icon strokeWidth={2.2} aria-hidden />
                      {child.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <ul className="m-0 grid list-none grid-cols-5 gap-1.5 p-0">
          {items.map((item) => {
            const Icon = item.icon;
            const hasChildren = Boolean(item.children?.length);
            const active = isTabNavActive(pathname, item);
            const expanded = openId === item.id;

            if (hasChildren) {
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      TAB_LINK,
                      (active || expanded) && TAB_LINK_CURRENT,
                    )}
                    aria-expanded={expanded}
                    aria-controls={expanded ? panelId : undefined}
                    aria-haspopup="menu"
                    onClick={() => toggleMenu(item)}
                  >
                    <Icon strokeWidth={2.2} aria-hidden />
                    <span className="inline-flex items-center gap-0.5">
                      {item.label}
                      <ChevronUp
                        size={10}
                        strokeWidth={2.6}
                        className={cn(
                          "size-2.5 transition-transform duration-fast",
                          !expanded && "rotate-180",
                        )}
                        aria-hidden
                      />
                    </span>
                  </button>
                </li>
              );
            }

            if (!item.href) return null;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  prefetch={false}
                  className={cn(TAB_LINK, active && TAB_LINK_CURRENT)}
                  aria-current={active ? "page" : undefined}
                  onClick={markPending(item.href)}
                  {...navPrefetchHandlers(queryClient, item.href)}
                >
                  <Icon strokeWidth={2.2} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

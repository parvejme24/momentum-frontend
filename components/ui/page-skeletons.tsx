import { Skeleton } from "@/components/ui/skeleton";
import {
  card,
  fieldRow,
  pageHead,
  rowBetween,
  tabBar,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

type PageHeadSkeletonProps = {
  withLede?: boolean;
  withAction?: boolean;
};

export function PageHeadSkeleton({
  withLede = false,
  withAction = false,
}: PageHeadSkeletonProps) {
  return (
    <header
      className={cn(pageHead, withAction && rowBetween, "mb-0")}
      aria-busy="true"
      aria-label="Loading page"
    >
      <div>
        <Skeleton className="mb-2.5 h-[0.72rem] w-[5.5rem]" />
        <Skeleton className="h-8 w-[min(12rem,48%)]" />
        {withLede ? (
          <>
            <Skeleton className="mt-3 h-[0.88rem] w-[min(28rem,92%)]" />
            <Skeleton className="mt-2 h-[0.88rem] w-[min(18rem,70%)]" />
          </>
        ) : null}
      </div>
      {withAction ? (
        <Skeleton className="h-12 min-w-[10.5rem] rounded-md" />
      ) : null}
    </header>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="mt-6 grid grid-cols-1 gap-[var(--gap)] sm:grid-cols-2 wide:grid-cols-4"
      aria-hidden
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={cn(card, "grid gap-2")}>
          <Skeleton className="h-[0.68rem] w-16" />
          <Skeleton className="mt-1.5 h-[1.35rem] w-[5.5rem]" />
          <Skeleton className="mt-1 h-[0.72rem] w-24" />
        </div>
      ))}
    </div>
  );
}

export function ToolbarSkeleton({
  tabs = 5,
  withSearch = true,
}: {
  tabs?: number;
  withSearch?: boolean;
}) {
  return (
    <div
      className="mt-6 mb-[18px] flex flex-wrap items-end justify-between gap-4"
      aria-hidden
    >
      <div className={tabBar}>
        {Array.from({ length: tabs }, (_, index) => (
          <Skeleton
            key={index}
            className="inline-block h-8 w-[4.2rem] rounded-lg"
            block={false}
          />
        ))}
      </div>
      {withSearch ? (
        <Skeleton className="h-[2.4rem] w-[min(16rem,100%)] rounded-lg" />
      ) : null}
    </div>
  );
}

export function ListRowsSkeleton({
  count = 6,
  withAvatar = true,
}: {
  count?: number;
  withAvatar?: boolean;
}) {
  return (
    <ul className="mt-6 m-0 list-none p-0" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <li
          key={index}
          className="flex items-center gap-3 border-b border-ink/8 py-3 last:border-b-0 last:pb-0"
        >
          <div className="min-w-0 flex-1">
            {withAvatar ? (
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-[2.2rem] shrink-0 rounded-full" block={false} />
                <div className="grid min-w-0 flex-1 gap-2">
                  <Skeleton className="h-[0.92rem] w-[72%]" />
                  <Skeleton className="h-[0.78rem] w-[52%]" />
                </div>
              </div>
            ) : (
              <>
                <Skeleton className="h-[0.92rem] w-[72%]" />
                <Skeleton className="mt-2 h-[0.78rem] w-[52%]" />
              </>
            )}
          </div>
          <Skeleton className="h-6 w-[4.4rem] rounded-full" block={false} />
        </li>
      ))}
    </ul>
  );
}

export function HabitCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section
      className="mt-6 grid grid-cols-1 items-stretch gap-[18px] min-[641px]:grid-cols-2 wide:grid-cols-4 [&>*]:m-0 [&>*]:min-w-0"
      aria-hidden
    >
      {Array.from({ length: count }, (_, index) => (
        <article
          key={index}
          className={cn(
            card,
            "pointer-events-none box-border grid h-[20.25rem] min-h-[20.25rem] max-h-[20.25rem] grid-rows-[5rem_7.25rem_3.75rem] gap-4 overflow-hidden p-[18px]",
          )}
        >
          <div className="flex min-h-0 items-start gap-3 overflow-hidden">
            <Skeleton className="size-[2.75rem] shrink-0 rounded-md" block={false} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Skeleton className="h-[0.92rem] w-[72%]" />
              <Skeleton className="h-[0.78rem] w-[52%]" />
            </div>
          </div>
          <Skeleton className="size-full min-h-0 rounded-md" />
          <div className="flex min-h-0 items-center justify-between gap-3 border-t border-ink/8 pt-3.5">
            <Skeleton className="h-[0.72rem] w-[38%]" />
            <Skeleton className="mt-0 h-[2.65rem] w-32 rounded-lg" block={false} />
          </div>
        </article>
      ))}
    </section>
  );
}

export function HabitRowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="mt-6 grid gap-3" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="pointer-events-none flex items-center gap-4 rounded-lg border-[var(--stroke)] bg-linear-to-br from-paper-white/92 to-paper-raised px-[18px] py-4 shadow-none max-nav:gap-3 max-nav:px-3.5 max-nav:py-[13px]"
        >
          <Skeleton className="size-[1.4rem] shrink-0 rounded-md" block={false} />
          <Skeleton className="size-[2.75rem] shrink-0 rounded-md" block={false} />
          <div className="grid min-w-0 flex-1 gap-2">
            <Skeleton className="h-[0.92rem] w-[72%]" />
            <Skeleton className="h-[0.78rem] w-[52%]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TodayPageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading today">
      <PageHeadSkeleton withAction />
      <section
        className={cn(
          card,
          "relative mt-6 flex items-start gap-[clamp(18px,3vw,28px)] overflow-hidden bg-linear-to-br from-blue-soft/55 via-paper-raised to-flame-soft/50 max-nav:flex-col max-nav:items-start before:pointer-events-none before:absolute before:right-[-20%] before:bottom-[-40%] before:z-0 before:size-[180px] before:rounded-full before:bg-[radial-gradient(circle,color-mix(in_srgb,var(--flame)_18%,transparent),transparent_70%)]",
        )}
      >
        <Skeleton className="relative z-[1] size-[5.5rem] shrink-0 rounded-full" block={false} />
        <div className="relative z-[1] min-w-0 flex-1 pt-1.5">
          <Skeleton className="h-[1.2rem] w-40" />
          <Skeleton className="mt-3 h-[0.88rem] w-[min(28rem,92%)]" />
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-[1.6rem] w-[5.8rem] rounded-full" block={false} />
            <Skeleton className="h-[1.6rem] w-[5.8rem] rounded-full" block={false} />
          </div>
        </div>
      </section>
      <section className="mt-8">
        <Skeleton className="mb-3.5 h-4 w-36" />
        <HabitRowsSkeleton count={3} />
      </section>
      <section className={cn(card, "mt-8")}>
        <Skeleton className="mb-3.5 h-4 w-36" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </section>
    </div>
  );
}

export function StatsPageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading stats">
      <PageHeadSkeleton />
      <ToolbarSkeleton tabs={4} withSearch={false} />
      <StatCardsSkeleton count={4} />
      <section className={cn(card, "mt-6")}>
        <Skeleton className="mb-3.5 h-4 w-36" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </section>
      <div className="mt-6 grid grid-cols-1 gap-[18px] nav:grid-cols-2">
        <section className={card}>
          <Skeleton className="mb-3.5 h-4 w-36" />
          <Skeleton className="h-[6.5rem] w-full rounded-lg" />
        </section>
        <section className={card}>
          <Skeleton className="mb-3.5 h-4 w-36" />
          <Skeleton className="h-[6.5rem] w-full rounded-lg" />
        </section>
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="min-w-0" aria-busy="true" aria-label="Loading dashboard">
      <PageHeadSkeleton withLede withAction />
      <StatCardsSkeleton count={4} />
      <div className="mt-6 grid grid-cols-1 gap-6 nav:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)]">
        <section className={card}>
          <Skeleton className="mb-3.5 h-4 w-36" />
          <ListRowsSkeleton count={5} />
        </section>
        <section className={card}>
          <Skeleton className="mb-3.5 h-4 w-36" />
          <ListRowsSkeleton count={4} />
        </section>
      </div>
    </div>
  );
}

export function UsersTableSkeleton({ count = 8 }: { count?: number }) {
  const rowGrid =
    "grid grid-cols-[minmax(0,2fr)_minmax(4.5rem,0.32fr)_minmax(5rem,0.38fr)_2.75rem_minmax(0,0.9fr)_auto] items-center gap-x-4 gap-y-3 border-b border-ink/9 px-5 py-4 last:border-b-0 max-[900px]:grid-cols-1 max-[900px]:gap-2.5";

  return (
    <ul className="m-0 list-none p-0" aria-busy="true" aria-label="Loading users">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className={rowGrid}>
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-[2.2rem] shrink-0 rounded-full" block={false} />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-[0.92rem] w-[72%]" block={false} />
              <Skeleton className="h-[0.78rem] w-[52%]" block={false} />
            </div>
          </div>
          <Skeleton className="h-6 w-[4.4rem] justify-self-start rounded-full" block={false} />
          <Skeleton className="h-6 w-[4.4rem] justify-self-center rounded-full" block={false} />
          <Skeleton className="h-[0.72rem] w-[38%] justify-self-start" block={false} />
          <Skeleton className="h-[0.78rem] w-[52%] justify-self-start" block={false} />
          <div className="flex items-center justify-end gap-2">
            <Skeleton className="h-9 w-16 rounded-md" block={false} />
            <Skeleton className="h-9 w-[4.75rem] rounded-md" block={false} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminListPageSkeleton({
  rows = 8,
  tabs = 5,
  withSearch = true,
  withStats = false,
  withAction = false,
}: {
  rows?: number;
  tabs?: number;
  withSearch?: boolean;
  withStats?: boolean;
  withAction?: boolean;
}) {
  return (
    <div className="min-w-0" aria-busy="true" aria-label="Loading list">
      <PageHeadSkeleton withLede withAction={withAction} />
      {withStats ? <StatCardsSkeleton count={4} /> : null}
      <ToolbarSkeleton tabs={tabs} withSearch={withSearch} />
      <ListRowsSkeleton count={rows} />
    </div>
  );
}

export function UserDetailSkeleton() {
  return (
    <div className="min-w-0" aria-busy="true" aria-label="Loading user">
      <PageHeadSkeleton withLede />
      <section className={cn(card, "mt-6")}>
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="size-12 shrink-0 rounded-full" block={false} />
          <div className="grid min-w-0 flex-1 gap-2">
            <Skeleton className="mb-0 h-4 w-36" />
            <Skeleton className="h-[0.78rem] w-[52%]" />
          </div>
        </div>
        <div className={cn(fieldRow, "mt-4")}>
          <Skeleton className="h-[2.65rem] flex-1 rounded-lg" />
          <Skeleton className="h-[2.65rem] flex-1 rounded-lg" />
        </div>
        <Skeleton className="mt-4 h-[2.65rem] w-32 rounded-lg" />
      </section>
      <section className={cn(card, "mt-6")}>
        <Skeleton className="mb-3.5 h-4 w-36" />
        <ListRowsSkeleton count={3} withAvatar={false} />
      </section>
      <section className={cn(card, "mt-6")}>
        <Skeleton className="mb-3.5 h-4 w-36" />
        <ListRowsSkeleton count={2} withAvatar={false} />
      </section>
    </div>
  );
}

export function HabitDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading habit">
      <Skeleton className="mb-3.5 h-[0.78rem] w-24" />
      <PageHeadSkeleton withAction />
      <section className={cn(card, "mt-6")}>
        <Skeleton className="h-36 w-full min-h-0 rounded-md" />
      </section>
      <section className={cn(card, "mt-6")}>
        <Skeleton className="mb-3.5 h-4 w-36" />
        <Skeleton className="h-[6.5rem] w-full rounded-lg" />
      </section>
    </div>
  );
}

export function SubscriptionPageSkeleton() {
  return (
    <div className="min-w-0" aria-busy="true" aria-label="Loading billing">
      <PageHeadSkeleton withLede />
      <section className={cn(card, "mb-[22px] mt-6")}>
        <Skeleton className="mb-3.5 h-4 w-36" />
        <div className="mt-6 grid grid-cols-2 gap-[18px] wide:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <Skeleton className="h-[0.68rem] w-16" />
              <Skeleton className="mt-1.5 h-[1.35rem] w-[5.5rem]" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-4 h-[2.65rem] w-32 rounded-lg" />
      </section>
      <section className="mb-[22px]">
        <Skeleton className="mb-3.5 h-4 w-36" />
        <div className="grid grid-cols-1 gap-[18px] wide:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <article
              key={index}
              className={cn(card, "pointer-events-none grid gap-3 p-[18px]")}
            >
              <Skeleton className="h-[0.92rem] w-[72%]" />
              <Skeleton className="mt-0.5 h-8 w-[56%]" />
              <Skeleton className="mt-3 h-[0.88rem] w-[min(28rem,92%)]" />
              <Skeleton className="mt-auto h-[2.65rem] w-full rounded-lg" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function AppShellSkeleton() {
  return (
    <div
      className="grid min-h-screen grid-cols-1 nav:grid-cols-[250px_1fr]"
      aria-busy="true"
      aria-label="Loading app"
    >
      <aside
        className="pointer-events-none sticky top-0 hidden h-screen flex-col gap-4 overflow-hidden border-r border-[var(--stroke)] bg-[linear-gradient(165deg,color-mix(in_srgb,var(--blue-soft)_55%,var(--paper-raised))_0%,var(--paper-raised)_42%,color-mix(in_srgb,var(--flame-soft)_28%,var(--paper-raised))_100%)] px-4 py-8 nav:flex"
        aria-hidden
      >
        <Skeleton className="h-[1.4rem] w-[8.5rem]" />
        <div className="mt-6 grid gap-1.5">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-[2.2rem] w-full rounded-md" />
          ))}
        </div>
        <Skeleton className="h-[2.65rem] w-full rounded-lg" />
        <div className="mt-auto shrink-0 border-t border-ink/8 pt-6">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-[2.2rem] shrink-0 rounded-full" block={false} />
            <div className="grid min-w-0 flex-1 gap-2">
              <Skeleton className="h-[0.78rem] w-[52%]" />
              <Skeleton className="h-[0.72rem] w-[38%]" />
            </div>
          </div>
        </div>
      </aside>
      <div className="min-w-0 p-[var(--space-page)]">
        <TodayPageSkeleton />
      </div>
    </div>
  );
}

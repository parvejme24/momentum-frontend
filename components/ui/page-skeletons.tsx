import { Skeleton } from "@/components/ui/skeleton";

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
      className={
        withAction ? "page-head row-between page-skeleton-head" : "page-head page-skeleton-head"
      }
      aria-busy="true"
      aria-label="Loading page"
    >
      <div>
        <Skeleton className="skeleton-eyebrow" />
        <Skeleton className="skeleton-page-title" />
        {withLede ? (
          <>
            <Skeleton className="skeleton-lede" />
            <Skeleton className="skeleton-lede skeleton-lede-short" />
          </>
        ) : null}
      </div>
      {withAction ? <Skeleton className="skeleton-action-btn" /> : null}
    </header>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="admin-summary page-skeleton-stats" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="card admin-stat-card page-skeleton-stat-card">
          <Skeleton className="skeleton-stat-k" />
          <Skeleton className="skeleton-stat-v" />
          <Skeleton className="skeleton-stat-note" />
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
    <div className="users-toolbar page-skeleton-toolbar" aria-hidden>
      <div className="tab-bar">
        {Array.from({ length: tabs }, (_, index) => (
          <Skeleton key={index} className="skeleton-tab" block={false} />
        ))}
      </div>
      {withSearch ? <Skeleton className="skeleton-search" /> : null}
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
    <ul className="admin-feed page-skeleton-list" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="admin-feed-item page-skeleton-list-row">
          <div className="admin-feed-copy">
            {withAvatar ? (
              <div className="page-skeleton-list-main">
                <Skeleton className="skeleton-avatar" block={false} />
                <div className="page-skeleton-list-text">
                  <Skeleton className="skeleton-line-md" />
                  <Skeleton className="skeleton-line-sm" />
                </div>
              </div>
            ) : (
              <>
                <Skeleton className="skeleton-line-md" />
                <Skeleton className="skeleton-line-sm" />
              </>
            )}
          </div>
          <Skeleton className="skeleton-chip-sm" block={false} />
        </li>
      ))}
    </ul>
  );
}

export function HabitCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="habit-lib-grid page-skeleton-habit-grid" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <article key={index} className="card habit-lib-card page-skeleton-habit-card">
          <div className="habit-lib-top">
            <Skeleton className="skeleton-habit-glyph" block={false} />
            <div className="habit-lib-copy">
              <Skeleton className="skeleton-line-md" />
              <Skeleton className="skeleton-line-sm" />
            </div>
          </div>
          <Skeleton className="skeleton-heatmap" />
          <Skeleton className="skeleton-line-xs" />
        </article>
      ))}
    </section>
  );
}

export function HabitRowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="habit-list page-skeleton-habit-rows" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="habit page-skeleton-habit-row">
          <Skeleton className="skeleton-check" block={false} />
          <Skeleton className="skeleton-habit-glyph" block={false} />
          <div className="page-skeleton-list-text">
            <Skeleton className="skeleton-line-md" />
            <Skeleton className="skeleton-line-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TodayPageSkeleton() {
  return (
    <div className="page-skeleton" aria-busy="true" aria-label="Loading today">
      <PageHeadSkeleton withAction />
      <section className="card summary page-skeleton-summary">
        <Skeleton className="skeleton-ring" block={false} />
        <div className="summary-copy">
          <Skeleton className="skeleton-line-lg" />
          <Skeleton className="skeleton-lede" />
          <div className="page-skeleton-chips">
            <Skeleton className="skeleton-chip-md" block={false} />
            <Skeleton className="skeleton-chip-md" block={false} />
          </div>
        </div>
      </section>
      <section className="today-section">
        <Skeleton className="skeleton-section-title" />
        <HabitRowsSkeleton count={3} />
      </section>
      <section className="card today-section">
        <Skeleton className="skeleton-section-title" />
        <Skeleton className="skeleton-chart" />
      </section>
    </div>
  );
}

export function StatsPageSkeleton() {
  return (
    <div className="page-skeleton" aria-busy="true" aria-label="Loading stats">
      <PageHeadSkeleton />
      <ToolbarSkeleton tabs={4} withSearch={false} />
      <StatCardsSkeleton count={4} />
      <section className="card page-skeleton-chart-card">
        <Skeleton className="skeleton-section-title" />
        <Skeleton className="skeleton-chart" />
      </section>
      <div className="stats-split page-skeleton-stats-split">
        <section className="card">
          <Skeleton className="skeleton-section-title" />
          <Skeleton className="skeleton-chart skeleton-chart-sm" />
        </section>
        <section className="card">
          <Skeleton className="skeleton-section-title" />
          <Skeleton className="skeleton-chart skeleton-chart-sm" />
        </section>
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="admin-dash page-skeleton" aria-busy="true" aria-label="Loading dashboard">
      <PageHeadSkeleton withLede withAction />
      <StatCardsSkeleton count={4} />
      <div className="admin-dash-split">
        <section className="card">
          <Skeleton className="skeleton-section-title" />
          <ListRowsSkeleton count={5} />
        </section>
        <section className="card">
          <Skeleton className="skeleton-section-title" />
          <ListRowsSkeleton count={4} />
        </section>
      </div>
    </div>
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
    <div className="users-page page-skeleton" aria-busy="true" aria-label="Loading list">
      <PageHeadSkeleton withLede withAction={withAction} />
      {withStats ? <StatCardsSkeleton count={4} /> : null}
      <ToolbarSkeleton tabs={tabs} withSearch={withSearch} />
      <ListRowsSkeleton count={rows} />
    </div>
  );
}

export function UserDetailSkeleton() {
  return (
    <div className="users-page page-skeleton" aria-busy="true" aria-label="Loading user">
      <PageHeadSkeleton withLede />
      <section className="card page-skeleton-detail-card">
        <div className="page-skeleton-list-main">
          <Skeleton className="skeleton-avatar skeleton-avatar-lg" block={false} />
          <div className="page-skeleton-list-text">
            <Skeleton className="skeleton-section-title" />
            <Skeleton className="skeleton-line-sm" />
          </div>
        </div>
        <div className="field-row" style={{ marginTop: 16 }}>
          <Skeleton className="skeleton-field" />
          <Skeleton className="skeleton-field" />
        </div>
        <Skeleton className="skeleton-button skeleton-button-inline" />
      </section>
      <section className="card page-skeleton-detail-card">
        <Skeleton className="skeleton-section-title" />
        <ListRowsSkeleton count={3} withAvatar={false} />
      </section>
      <section className="card page-skeleton-detail-card">
        <Skeleton className="skeleton-section-title" />
        <ListRowsSkeleton count={2} withAvatar={false} />
      </section>
    </div>
  );
}

export function HabitDetailSkeleton() {
  return (
    <div className="page-skeleton" aria-busy="true" aria-label="Loading habit">
      <Skeleton className="skeleton-back-link" />
      <PageHeadSkeleton withAction />
      <section className="card page-skeleton-detail-card">
        <Skeleton className="skeleton-heatmap skeleton-heatmap-lg" />
      </section>
      <section className="card page-skeleton-detail-card">
        <Skeleton className="skeleton-section-title" />
        <Skeleton className="skeleton-chart skeleton-chart-sm" />
      </section>
    </div>
  );
}

export function SubscriptionPageSkeleton() {
  return (
    <div className="subscription-page page-skeleton" aria-busy="true" aria-label="Loading billing">
      <PageHeadSkeleton withLede />
      <section className="card subscription-current page-skeleton-detail-card">
        <Skeleton className="skeleton-section-title" />
        <div className="subscription-current-grid page-skeleton-sub-grid">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <Skeleton className="skeleton-stat-k" />
              <Skeleton className="skeleton-stat-v" />
            </div>
          ))}
        </div>
        <Skeleton className="skeleton-button skeleton-button-inline" />
      </section>
      <section className="subscription-plans">
        <Skeleton className="skeleton-section-title" />
        <div className="subscription-plan-grid">
          {Array.from({ length: 3 }, (_, index) => (
            <article key={index} className="card subscription-plan page-skeleton-plan-card">
              <Skeleton className="skeleton-line-md" />
              <Skeleton className="skeleton-price" />
              <Skeleton className="skeleton-lede" />
              <Skeleton className="skeleton-button" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function AppShellSkeleton() {
  return (
    <div className="app page-skeleton-shell" aria-busy="true" aria-label="Loading app">
      <aside className="sidebar page-skeleton-sidebar" aria-hidden>
        <Skeleton className="skeleton-brand" />
        <div className="page-skeleton-nav">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="skeleton-nav-item" />
          ))}
        </div>
        <Skeleton className="skeleton-button" />
        <div className="side-foot">
          <div className="page-skeleton-list-main">
            <Skeleton className="skeleton-avatar" block={false} />
            <div className="page-skeleton-list-text">
              <Skeleton className="skeleton-line-sm" />
              <Skeleton className="skeleton-line-xs" />
            </div>
          </div>
        </div>
      </aside>
      <div className="main">
        <TodayPageSkeleton />
      </div>
    </div>
  );
}

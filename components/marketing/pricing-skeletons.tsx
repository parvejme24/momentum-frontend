import { Skeleton } from "@/components/ui/skeleton";

function PricingPlanCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <article
      className={
        featured
          ? "card pricing-plan-card featured pricing-plan-card-skeleton"
          : "card pricing-plan-card pricing-plan-card-skeleton"
      }
      aria-hidden
    >
      <div className="pricing-plan-top">
        <Skeleton className="skeleton-title" />
        {featured ? <Skeleton className="skeleton-chip" block={false} /> : null}
      </div>
      <Skeleton className="skeleton-price" />
      <Skeleton className="skeleton-blurb" />
      <Skeleton className="skeleton-blurb skeleton-blurb-short" />
      <ul className="subscription-features pricing-plan-features-skeleton">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index}>
            <Skeleton className="skeleton-feature-icon" block={false} />
            <Skeleton className="skeleton-feature-line" />
          </li>
        ))}
      </ul>
      <Skeleton className="skeleton-button" />
    </article>
  );
}

export function PricingPlanGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="pricing-plan-grid"
      aria-busy="true"
      aria-label="Loading plans"
    >
      {Array.from({ length: count }, (_, index) => (
        <PricingPlanCardSkeleton key={index} featured={index === 1} />
      ))}
    </div>
  );
}

export function PricingCompareSkeleton({
  planCount = 3,
  rowCount = 8,
}: {
  planCount?: number;
  rowCount?: number;
}) {
  return (
    <div
      className="card pricing-table-card pricing-compare-skeleton"
      aria-busy="true"
      aria-label="Loading plan comparison"
    >
      <div className="pricing-table-scroll">
        <table className="pricing-table">
          <thead>
            <tr>
              <th scope="col">
                <Skeleton className="skeleton-table-head" />
              </th>
              {Array.from({ length: planCount }, (_, index) => (
                <th key={index} scope="col">
                  <Skeleton className="skeleton-table-head" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, rowIndex) => (
              <tr key={rowIndex}>
                <th scope="row">
                  <Skeleton className="skeleton-table-label" />
                </th>
                {Array.from({ length: planCount }, (_, colIndex) => (
                  <td key={colIndex}>
                    <Skeleton className="skeleton-table-cell" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { card, skeleton } from "@/lib/ui";

function PricingPlanCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <article
      className={cn(
        card,
        "m-0 flex h-full min-h-full flex-col gap-3.5 p-[22px] pointer-events-none dark:bg-[linear-gradient(165deg,color-mix(in_srgb,var(--paper-white)_88%,var(--blue-soft)),var(--paper-raised))]",
        featured &&
          "border-blue shadow-[var(--shadow-lift),var(--focus-ring)] dark:border-[#8ba4c9]/45 dark:shadow-[var(--shadow),var(--shadow-glow)]",
      )}
      aria-hidden
    >
      <div className="flex min-h-8 items-center justify-between gap-2.5">
        <Skeleton className="h-[1.1rem] w-[42%]" />
        {featured ? (
          <Skeleton className="inline-block h-[1.4rem] w-[4.2rem] rounded-full" block={false} />
        ) : null}
      </div>
      <Skeleton className="mt-0.5 h-8 w-[56%]" />
      <Skeleton className="h-[0.82rem] w-full" />
      <Skeleton className="h-[0.82rem] w-[78%]" />
      <ul className="m-0 flex flex-1 list-none flex-col gap-2 p-0">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index} className="flex items-center gap-2">
            <Skeleton className="inline-block size-[0.95rem] shrink-0 rounded-full" block={false} />
            <Skeleton className="h-[0.78rem] flex-1" />
          </li>
        ))}
      </ul>
      <Skeleton className="mt-auto h-[2.65rem] w-full rounded-lg" />
    </article>
  );
}

export function PricingPlanGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 items-stretch gap-[18px] wide:grid-cols-3"
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
      className={cn(card, "mt-[var(--space-4)] overflow-hidden p-0")}
      aria-busy="true"
      aria-label="Loading plan comparison"
    >
      <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[520px] border-collapse [&_td]:align-middle [&_th]:align-middle">
          <thead>
            <tr>
              <th
                scope="col"
                className="border-b border-[var(--divider)] bg-[color-mix(in_srgb,var(--paper-white)_80%,var(--rule))] px-[18px] py-3.5 text-left font-mono text-[0.66rem] font-semibold tracking-[0.12em] text-ink-50 uppercase [&:nth-child(3)]:bg-blue-soft"
              >
                <span className={cn(skeleton, "block h-[0.72rem] w-[4.5rem]")} />
              </th>
              {Array.from({ length: planCount }, (_, index) => (
                <th
                  key={index}
                  scope="col"
                  className="border-b border-[var(--divider)] bg-[color-mix(in_srgb,var(--paper-white)_80%,var(--rule))] px-[18px] py-3.5 text-left font-mono text-[0.66rem] font-semibold tracking-[0.12em] text-ink-50 uppercase [&:nth-child(3)]:bg-blue-soft"
                >
                  <span className={cn(skeleton, "block h-[0.72rem] w-[4.5rem]")} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, rowIndex) => (
              <tr key={rowIndex} className="last:[&>td]:border-b-0 last:[&>th]:border-b-0">
                <th
                  scope="row"
                  className="border-b border-[var(--divider)] px-[18px] py-3.5 text-left text-[0.88rem] font-semibold text-ink"
                >
                  <span className={cn(skeleton, "block h-[0.82rem] w-[7.5rem]")} />
                </th>
                {Array.from({ length: planCount }, (_, colIndex) => (
                  <td
                    key={colIndex}
                    className="border-b border-[var(--divider)] px-[18px] py-3.5 text-left text-[0.88rem] [&:nth-child(3)]:bg-blue-soft"
                  >
                    <span className={cn(skeleton, "block h-[0.82rem] w-[2.4rem]")} />
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

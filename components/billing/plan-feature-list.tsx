import { Check, X } from "lucide-react";

import type { PackageFeature } from "@/lib/api/types";
import {
  compareCellText,
  featureLabel,
  normalizePackageFeature,
} from "@/lib/pricing/features";
import { cn } from "@/lib/utils";

function FeatureInactiveIcon({
  className,
  labelled,
}: {
  className?: string;
  labelled?: string;
}) {
  return (
    <X
      size={16}
      strokeWidth={2.6}
      className={cn("mt-px shrink-0 text-flame", className)}
      aria-hidden={labelled ? undefined : true}
      aria-label={labelled}
    />
  );
}

function FeatureActiveIcon({
  className,
  labelled,
}: {
  className?: string;
  labelled?: string;
}) {
  return (
    <Check
      size={16}
      strokeWidth={2.6}
      className={cn("mt-px shrink-0 text-blue", className)}
      aria-hidden={labelled ? undefined : true}
      aria-label={labelled}
    />
  );
}

type PlanFeatureListProps = {
  features: Array<string | PackageFeature>;
  className?: string;
};

export function PlanFeatureList({
  features,
  className,
}: PlanFeatureListProps) {
  return (
    <ul
      className={cn(
        "m-0 grid flex-1 list-none gap-2 p-0 text-[0.88rem] leading-[1.45] text-ink-70",
        className,
      )}
    >
      {features.map((feature, index) => {
        const normalized = normalizePackageFeature(feature);
        const label = featureLabel(feature);

        if (!label) return null;

        return (
          <li
            key={`${label}-${index}`}
            className={cn(
              "flex items-start gap-2",
              normalized.isActive ? "text-ink-70" : "text-flame",
            )}
          >
            {normalized.isActive ? (
              <FeatureActiveIcon className="mt-0.5" />
            ) : (
              <FeatureInactiveIcon className="mt-0.5" />
            )}
            <span>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}

type CompareFeatureCellProps = {
  feature?: PackageFeature;
};

export function CompareFeatureCell({ feature }: CompareFeatureCellProps) {
  const normalized = feature ? normalizePackageFeature(feature) : undefined;

  if (!normalized?.isActive) {
    return (
      <FeatureInactiveIcon
        className="inline-block align-[-2px]"
        labelled="Not included"
      />
    );
  }

  const detail = compareCellText(normalized);
  if (detail === "✓") {
    return (
      <FeatureActiveIcon
        className="inline-block align-[-2px]"
        labelled="Included"
      />
    );
  }

  return <>{detail}</>;
}

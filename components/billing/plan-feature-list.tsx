import { Check, X } from "lucide-react";

import type { PackageFeature } from "@/lib/api/types";
import {
  compareCellText,
  featureLabel,
  normalizePackageFeature,
} from "@/lib/pricing/features";

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
      className={["plan-feature-icon", "plan-feature-icon-inactive", className]
        .filter(Boolean)
        .join(" ")}
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
      className={["plan-feature-icon", "plan-feature-icon-active", className]
        .filter(Boolean)
        .join(" ")}
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
  className = "subscription-features",
}: PlanFeatureListProps) {
  return (
    <ul className={className}>
      {features.map((feature, index) => {
        const normalized = normalizePackageFeature(feature);
        const label = featureLabel(feature);

        if (!label) return null;

        return (
          <li
            key={`${label}-${index}`}
            className={
              normalized.isActive
                ? "plan-feature-row plan-feature-row-active"
                : "plan-feature-row plan-feature-row-inactive"
            }
          >
            {normalized.isActive ? (
              <FeatureActiveIcon />
            ) : (
              <FeatureInactiveIcon />
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
        className="pricing-compare-icon"
        labelled="Not included"
      />
    );
  }

  const detail = compareCellText(normalized);
  if (detail === "✓") {
    return (
      <FeatureActiveIcon className="pricing-compare-icon" labelled="Included" />
    );
  }

  return <>{detail}</>;
}

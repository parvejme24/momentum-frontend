import type { CompareRow, PackageFeature } from "@/lib/api/types";

function readIsActive(record: Record<string, unknown>): boolean {
  const value = record.isActive ?? record.is_active ?? record.active;

  if (value === false || value === "false" || value === 0) return false;
  if (value === true || value === "true" || value === 1) return true;
  return false;
}

export function normalizePackageFeature(raw: unknown): PackageFeature {
  if (typeof raw === "string") {
    return { isActive: true, name: raw };
  }

  if (!raw || typeof raw !== "object") {
    return { isActive: false, name: "" };
  }

  const record = raw as Record<string, unknown>;
  const name =
    typeof record.name === "string"
      ? record.name
      : typeof record.label === "string"
        ? record.label
        : "";

  return {
    isActive: readIsActive(record),
    name,
  };
}

export function normalizePackageFeatures(raw: unknown): PackageFeature[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizePackageFeature);
}

export function featureLabel(feature: string | PackageFeature): string {
  return typeof feature === "string"
    ? feature
    : normalizePackageFeature(feature).name;
}

export function featureIsActive(feature: string | PackageFeature): boolean {
  if (typeof feature === "string") return true;
  return normalizePackageFeature(feature).isActive;
}

export function planFeatureLabels(
  features: Array<string | PackageFeature>,
): string[] {
  return features.map(featureLabel);
}

export function compareCellText(feature: PackageFeature | undefined): string {
  const normalized = feature ? normalizePackageFeature(feature) : undefined;
  if (!normalized?.isActive) return "—";
  const parts = normalized.name.split(": ");
  return parts.length > 1 ? parts.slice(1).join(": ") : "✓";
}

export function planFeaturesForDisplay(
  plan: { slug: string; features: unknown },
  compare?: { features: CompareRow[] },
): PackageFeature[] {
  const normalized = normalizePackageFeatures(plan.features);

  if (!compare?.features.length) {
    return normalized;
  }

  const fromCompare = compare.features.map((row) => {
    const cell = normalizePackageFeature(row.values[plan.slug]);
    return {
      isActive: cell.isActive,
      name: cell.name || row.label,
    };
  });

  const hasInactiveInPlan = normalized.some((feature) => !feature.isActive);
  const hasInactiveInCompare = fromCompare.some((feature) => !feature.isActive);

  if (
    (!hasInactiveInPlan && hasInactiveInCompare) ||
    normalized.length < fromCompare.length
  ) {
    return fromCompare;
  }

  return normalized;
}

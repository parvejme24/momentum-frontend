import type { PlanInterval } from "@/lib/api/types";

export function formatCents(cents: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

export function dollarsToCents(value: string): number {
  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
}

export function intervalLabel(interval: PlanInterval, count = 1): string {
  if (interval === "forever") return "forever";
  if (interval === "one_time") return "one-time";
  if (interval === "year") {
    return count === 1 ? "/ year" : `/ ${count} years`;
  }
  return count === 1 ? "/ month" : `/ ${count} months`;
}

export function planPriceLabel(
  priceCents: number,
  currency: string,
  interval: PlanInterval,
  intervalCount = 1,
): { price: string; period: string } {
  return {
    price: formatCents(priceCents, currency),
    period: intervalLabel(interval, intervalCount),
  };
}

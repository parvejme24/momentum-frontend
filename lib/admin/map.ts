import type {
  AdminUser,
  AdminUserAccountStatus,
  PaymentMethod,
  PaymentStatus,
  PlanStatus,
  SubscriptionStatus,
} from "@/lib/api/types";
import { formatPrettyIso } from "@/lib/dates";

export function formatLastActive(iso: string | null) {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const minutes = Math.round((Date.now() - then) / 60_000);
  if (minutes < 5) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return formatPrettyIso(iso);
}

export function accountStatusLabel(status: AdminUserAccountStatus) {
  if (status === "banned") return "Banned";
  if (status === "trashed") return "Trashed";
  return "Active";
}

export function accountStatusChip(status: AdminUserAccountStatus) {
  if (status === "active") return "chip chip-blue";
  if (status === "banned") return "chip chip-flame";
  return "chip chip-quiet";
}

export function subscriptionStatusLabel(status: SubscriptionStatus) {
  if (status === "trialing") return "Trial";
  if (status === "past_due") return "Past due";
  if (status === "canceled") return "Canceled";
  if (status === "expired") return "Expired";
  return "Active";
}

export function subscriptionStatusChip(status: SubscriptionStatus) {
  if (status === "active") return "chip chip-blue";
  if (status === "trialing") return "chip chip-flame";
  if (status === "past_due") return "chip chip-flame";
  return "chip chip-quiet";
}

export function paymentStatusLabel(status: PaymentStatus) {
  if (status === "succeeded") return "Paid";
  if (status === "pending") return "Pending";
  if (status === "failed") return "Failed";
  return "Refunded";
}

export function paymentStatusChip(status: PaymentStatus) {
  if (status === "succeeded") return "chip chip-blue";
  if (status === "pending") return "chip chip-quiet";
  if (status === "failed") return "chip chip-flame";
  return "chip chip-quiet";
}

export function paymentMethodLabel(method: PaymentMethod) {
  if (method === "card") return "Card";
  if (method === "bank_transfer") return "Bank";
  if (method === "cash") return "Cash";
  if (method === "manual") return "Manual";
  return "Other";
}

export function planStatusLabel(status: PlanStatus) {
  if (status === "published") return "Published";
  if (status === "draft") return "Draft";
  return "Archived";
}

export function planName(user: AdminUser) {
  return user.plan?.name ?? "Free";
}

export function initialFromName(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function mutationErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

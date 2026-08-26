import type {
  AdminUser,
  AdminUserAccountStatus,
  PaymentMethod,
  PaymentStatus,
  PlanStatus,
  SubscriptionStatus,
} from "@/lib/api/types";
import { ApiError } from "@/lib/api/errors";
import { formatPrettyIso } from "@/lib/dates";
import { chip, chipBlue, chipFlame, chipQuiet } from "@/lib/ui";
import { cn } from "@/lib/utils";

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
  if (status === "active") return cn(chip, chipBlue);
  if (status === "banned") return cn(chip, chipFlame);
  return cn(chip, chipQuiet);
}

export function subscriptionStatusLabel(status: SubscriptionStatus) {
  if (status === "trialing") return "Trial";
  if (status === "past_due") return "Past due";
  if (status === "canceled") return "Canceled";
  if (status === "expired") return "Expired";
  return "Active";
}

export function subscriptionStatusChip(status: SubscriptionStatus) {
  if (status === "active") return cn(chip, chipBlue);
  if (status === "trialing") return cn(chip, chipFlame);
  if (status === "past_due") return cn(chip, chipFlame);
  return cn(chip, chipQuiet);
}

export function paymentStatusLabel(status: PaymentStatus) {
  if (status === "succeeded") return "Paid";
  if (status === "pending") return "Pending";
  if (status === "failed") return "Failed";
  return "Refunded";
}

export function paymentStatusChip(status: PaymentStatus) {
  if (status === "succeeded") return cn(chip, chipBlue);
  if (status === "pending") return cn(chip, chipQuiet);
  if (status === "failed") return cn(chip, chipFlame);
  return cn(chip, chipQuiet);
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
  if (error instanceof ApiError) {
    if (error.code === "RATE_LIMITED") {
      return "Too many AI requests — wait a minute and try again.";
    }
    if (error.code === "NETWORK_ERROR") {
      return "Could not reach the server. Check your connection and try again.";
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

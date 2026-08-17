import type { User, UserRole } from "@/lib/api/types";

/** Demo-friendly role: prefer API role, then email hint, else customer. */
export function getUserRole(user: User | null | undefined): UserRole {
  if (user?.role === "admin" || user?.role === "customer") return user.role;
  const email = user?.email?.toLowerCase() ?? "";
  if (email.includes("admin")) return "admin";
  return "customer";
}

export function isAdmin(user: User | null | undefined) {
  return getUserRole(user) === "admin";
}

export function isCustomer(user: User | null | undefined) {
  return getUserRole(user) === "customer";
}

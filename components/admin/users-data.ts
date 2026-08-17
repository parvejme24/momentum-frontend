import customer from "@/data/customer.json";

export type ManagedUserStatus = "active" | "trial" | "cancelled" | "suspended";
export type ManagedUserPlan = "free" | "pro" | "team";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  timezone: string;
  plan: ManagedUserPlan;
  status: ManagedUserStatus;
  habits: number;
  joinedAt: string;
  lastActive: string;
};

export const MANAGED_USERS: ManagedUser[] = [
  {
    id: "u1",
    name: customer.profile.name,
    email: customer.profile.email,
    timezone: customer.profile.timezone,
    plan: customer.subscription.planId as ManagedUserPlan,
    status: customer.subscription.status as ManagedUserStatus,
    habits: customer.habits.active.length,
    joinedAt: customer.profile.memberSince,
    lastActive: "Today",
  },
  {
    id: "u2",
    name: "Nadia Rahman",
    email: "nadia@studio.co",
    timezone: "Asia/Dhaka",
    plan: "pro",
    status: "active",
    habits: 4,
    joinedAt: "3 Jan 2026",
    lastActive: "2 hours ago",
  },
  {
    id: "u3",
    name: "Samir Khan",
    email: "samir@mail.com",
    timezone: "Asia/Kolkata",
    plan: "free",
    status: "trial",
    habits: 2,
    joinedAt: "28 Jul 2026",
    lastActive: "Yesterday",
  },
  {
    id: "u4",
    name: "Lina Ortiz",
    email: "lina@ortiz.dev",
    timezone: "America/New_York",
    plan: "team",
    status: "active",
    habits: 11,
    joinedAt: "19 Nov 2025",
    lastActive: "Today",
  },
  {
    id: "u5",
    name: "Omar Faruk",
    email: "omar@faruk.io",
    timezone: "Asia/Dubai",
    plan: "pro",
    status: "cancelled",
    habits: 3,
    joinedAt: "2 Mar 2026",
    lastActive: "18 days ago",
  },
  {
    id: "u6",
    name: "Maya Chen",
    email: "maya@chen.co",
    timezone: "Europe/London",
    plan: "free",
    status: "suspended",
    habits: 1,
    joinedAt: "14 May 2026",
    lastActive: "41 days ago",
  },
];

export function planLabel(plan: ManagedUserPlan) {
  if (plan === "pro") return "Pro";
  if (plan === "team") return "Team";
  return "Free";
}

export function statusLabel(status: ManagedUserStatus) {
  if (status === "active") return "Active";
  if (status === "trial") return "Trial";
  if (status === "cancelled") return "Cancelled";
  return "Suspended";
}

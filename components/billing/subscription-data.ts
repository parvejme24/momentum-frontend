import customer from "@/data/customer.json";

export type PlanId = "free" | "pro" | "team";

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  blurb: string;
  features: string[];
  highlighted?: boolean;
  /** Public pricing page CTA */
  publicCta?: {
    label: string;
    href: string;
    variant?: "primary" | "ghost" | "flame";
  };
};

export type Invoice = {
  id: string;
  label: string;
  date: string;
  amount: string;
  status: "paid" | "upcoming" | "failed";
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "Enough to build one honest chain.",
    features: [
      "Up to 3 habits",
      "90-day heatmaps",
      "Reminders on one device",
      "Export CSV anytime",
    ],
    publicCta: { label: "Start free", href: "/register", variant: "ghost" },
  },
  {
    id: "pro",
    name: "Pro",
    price: "$6",
    period: "/ month",
    blurb: "The logbook with the full year chain.",
    highlighted: true,
    features: [
      "Unlimited habits",
      "364-day year chain",
      "Stats & weekday insight",
      "Reminders everywhere",
      "JSON + CSV export",
    ],
    publicCta: { label: "Start with Pro", href: "/register", variant: "primary" },
  },
  {
    id: "team",
    name: "Team",
    price: "$12",
    period: "/ seat / mo",
    blurb: "Shared accountability without the noise.",
    features: [
      "Everything in Pro",
      "Shared habit boards",
      "Admin seats",
      "Priority support",
    ],
    publicCta: { label: "Contact for Team", href: "/register", variant: "ghost" },
  },
];

export const CURRENT_SUBSCRIPTION = customer.subscription as {
  planId: PlanId;
  renewsOn: string;
  paymentMethod: string;
  billingEmail: string;
  status: "active";
};

export const INVOICES: Invoice[] = customer.invoices as Invoice[];

import type { Metadata } from "next";

import { UsersPage } from "@/components/admin/users-page";

export const metadata: Metadata = {
  title: "Users — Momentum",
  description: "Admin view of Momentum accounts, plans, and activity.",
};

export default function UsersRoutePage() {
  return <UsersPage />;
}

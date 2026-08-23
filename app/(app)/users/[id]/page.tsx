import type { Metadata } from "next";

import { UserDetailPage } from "@/components/admin/user-detail-page";

export const metadata: Metadata = {
  title: "User — Momentum",
  description: "Admin view of a Momentum account.",
};

export default function UserDetailRoutePage() {
  return <UserDetailPage />;
}

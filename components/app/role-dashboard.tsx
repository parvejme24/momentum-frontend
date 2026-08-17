"use client";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { TodayPage } from "@/components/today/today-page";
import { PageSpinner } from "@/components/ui/page-spinner";
import { useAuth } from "@/lib/auth/context";
import { isAdmin } from "@/lib/auth/role";

export function RoleDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isAdmin(user)) {
    return <AdminDashboard />;
  }

  return <TodayPage />;
}

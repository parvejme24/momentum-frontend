"use client";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { TodayPage } from "@/components/today/today-page";
import { useAuth } from "@/lib/auth/context";
import { isAdmin } from "@/lib/auth/role";

export function RoleDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="page-head">
        <p className="eyebrow">Momentum</p>
        <h1>Dashboard</h1>
        <p className="hint" style={{ marginTop: 12 }}>
          Loading…
        </p>
      </div>
    );
  }

  if (isAdmin(user)) {
    return <AdminDashboard />;
  }

  return <TodayPage />;
}

"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/context";

export function RoleGate({
  allowed,
  title,
  message,
  children,
}: {
  allowed: boolean;
  title: string;
  message: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="page-head">
        <p className="eyebrow">Momentum</p>
        <h1>{title}</h1>
        <p className="hint" style={{ marginTop: 12 }}>
          Loading…
        </p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="page-head">
        <p className="eyebrow">Restricted</p>
        <h1>{title}</h1>
        <p className="lede" style={{ marginTop: 12, maxWidth: "42ch" }}>
          {message}
        </p>
        <p style={{ marginTop: 24 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => router.push("/dashboard")}
          >
            Back to dashboard
          </button>
        </p>
      </div>
    );
  }

  return children;
}

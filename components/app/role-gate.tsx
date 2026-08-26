"use client";

import { useRouter } from "next/navigation";

import { PageHeadSkeleton } from "@/components/ui/page-skeletons";
import { useAuth } from "@/lib/auth/context";
import { btn, btnPrimary, eyebrow, lede, pageHead } from "@/lib/ui";
import { cn } from "@/lib/utils";

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
    return <PageHeadSkeleton withLede />;
  }

  if (!allowed) {
    return (
      <div className={pageHead}>
        <p className={cn(eyebrow, "mb-2")}>Restricted</p>
        <h1>{title}</h1>
        <p className={cn(lede, "mt-3 max-w-[42ch]")}>{message}</p>
        <p className="mt-6">
          <button
            type="button"
            className={cn(btn, btnPrimary)}
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

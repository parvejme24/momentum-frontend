import { api } from "@/lib/api/client";
import { adminPricingPath, pricingPath, queryString } from "@/lib/api/config";
import type {
  AdminPlan,
  CompareResponse,
  CreatePlanInput,
  PricingPackage,
  PublicPlan,
  UpdatePlanInput,
  UpdatePlanResponse,
} from "@/lib/api/types";
import {
  normalizePackageFeature,
  normalizePackageFeatures,
} from "@/lib/pricing/features";

function unwrapPlan(
  payload: { plan: AdminPlan | PublicPlan } | AdminPlan | PublicPlan,
): AdminPlan | PublicPlan {
  if (payload && typeof payload === "object" && "plan" in payload) {
    return payload.plan;
  }
  return payload as AdminPlan | PublicPlan;
}

function normalizePublicPlan(plan: PublicPlan): PublicPlan {
  return {
    ...plan,
    features: normalizePackageFeatures(plan.features),
  };
}

function normalizeCompare(payload: CompareResponse & { rows?: CompareResponse["features"] }): CompareResponse {
  const featureRows = Array.isArray(payload.features)
    ? payload.features
    : Array.isArray(payload.rows)
      ? payload.rows
      : [];

  return {
    plans: Array.isArray(payload.plans) ? payload.plans : [],
    features: featureRows.map((row) => ({
      ...row,
      values: Object.fromEntries(
        Object.entries(row.values ?? {}).map(([slug, feature]) => [
          slug,
          normalizePackageFeature(feature),
        ]),
      ),
    })),
  };
}

export async function listPublicPlans(): Promise<PublicPlan[]> {
  const payload = await api.get<{ plans: PublicPlan[] }>(
    pricingPath("plans"),
    { skipAuthRetry: true },
  );
  return Array.isArray(payload.plans)
    ? payload.plans.map(normalizePublicPlan)
    : [];
}

export async function getPublicPlan(slug: string): Promise<PublicPlan> {
  const payload = await api.get<{ plan: PublicPlan }>(
    pricingPath(`plans/${slug}`),
    { skipAuthRetry: true },
  );
  return normalizePublicPlan(unwrapPlan(payload) as PublicPlan);
}

export async function getPlanCompare(): Promise<CompareResponse> {
  const payload = await api.get<CompareResponse>(pricingPath("compare"), {
    skipAuthRetry: true,
  });
  return normalizeCompare(payload);
}

function normalizePricingPackage(pkg: PricingPackage): PricingPackage {
  return {
    ...pkg,
    features: normalizePackageFeatures(pkg.features),
  };
}

export async function listPricingPackages(): Promise<PricingPackage[]> {
  const payload = await api.get<
    PricingPackage[] | { packages: PricingPackage[] }
  >(pricingPath("packages"), { skipAuthRetry: true });
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.packages)
      ? payload.packages
      : [];
  return rows.map(normalizePricingPackage);
}

export async function listAdminPlans(
  status: "draft" | "published" | "archived" | "all" = "all",
): Promise<AdminPlan[]> {
  const payload = await api.get<{ plans: AdminPlan[] }>(
    `${adminPricingPath("plans")}${queryString({ status })}`,
  );
  return Array.isArray(payload.plans) ? payload.plans : [];
}

export async function getAdminPlan(id: string): Promise<AdminPlan> {
  const payload = await api.get<{ plan: AdminPlan }>(
    adminPricingPath(`plans/${id}`),
  );
  return unwrapPlan(payload) as AdminPlan;
}

export async function createAdminPlan(body: CreatePlanInput): Promise<AdminPlan> {
  const payload = await api.post<{ plan: AdminPlan }>(
    adminPricingPath("plans"),
    body as Record<string, unknown>,
  );
  return unwrapPlan(payload) as AdminPlan;
}

export async function updateAdminPlan(
  id: string,
  body: UpdatePlanInput,
): Promise<UpdatePlanResponse> {
  return api.patch<UpdatePlanResponse>(
    adminPricingPath(`plans/${id}`),
    body as Record<string, unknown>,
  );
}

export async function publishAdminPlan(id: string): Promise<AdminPlan> {
  const payload = await api.post<{ plan: AdminPlan }>(
    adminPricingPath(`plans/${id}/publish`),
    {},
  );
  return unwrapPlan(payload) as AdminPlan;
}

export async function archiveAdminPlan(id: string): Promise<AdminPlan> {
  const payload = await api.post<{ plan: AdminPlan }>(
    adminPricingPath(`plans/${id}/archive`),
    {},
  );
  return unwrapPlan(payload) as AdminPlan;
}

export async function reorderAdminPlans(ids: string[]): Promise<AdminPlan[]> {
  const payload = await api.post<{ plans: AdminPlan[] }>(
    adminPricingPath("plans/reorder"),
    { ids },
  );
  return Array.isArray(payload.plans) ? payload.plans : [];
}

export async function deleteAdminPlan(id: string): Promise<void> {
  await api.delete(adminPricingPath(`plans/${id}`));
}

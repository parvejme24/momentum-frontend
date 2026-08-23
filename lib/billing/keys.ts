export const billingKeys = {
  all: ["billing"] as const,
  config: () => ["billing", "config"] as const,
  entitlements: () => ["billing", "entitlements"] as const,
  subscription: () => ["billing", "subscription"] as const,
  invoices: () => ["billing", "invoices"] as const,
};

export const pricingKeys = {
  all: ["pricing"] as const,
  public: () => ["pricing", "public"] as const,
  packages: () => ["pricing", "packages"] as const,
  compare: () => ["pricing", "compare"] as const,
  plan: (slug: string) => ["pricing", "plan", slug] as const,
};

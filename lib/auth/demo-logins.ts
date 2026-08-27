export type DemoLoginRole = "customer" | "admin";

export type DemoLogin = {
  role: DemoLoginRole;
  label: string;
  email: string;
  password: string;
};

const DEFAULT_DEMO_PASSWORD = "password123";

export const DEMO_CUSTOMER_EMAIL =
  process.env.NEXT_PUBLIC_DEMO_CUSTOMER_EMAIL?.trim() ||
  "customer@momentum.app";

export const DEMO_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL?.trim() || "admin@momentum.app";

export const DEMO_PASSWORD =
  process.env.NEXT_PUBLIC_DEMO_PASSWORD?.trim() || DEFAULT_DEMO_PASSWORD;

export const DEMO_LOGINS: DemoLogin[] = [
  {
    role: "customer",
    label: "Login as Customer",
    email: DEMO_CUSTOMER_EMAIL,
    password: DEMO_PASSWORD,
  },
  {
    role: "admin",
    label: "Login as Admin",
    email: DEMO_ADMIN_EMAIL,
    password: DEMO_PASSWORD,
  },
];

/** Show quick demo logins unless explicitly disabled. */
export function showDemoLogins(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_DEMO_LOGINS !== "false";
}

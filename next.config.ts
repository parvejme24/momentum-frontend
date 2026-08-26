import type { NextConfig } from "next";

/** `/v1/*` is proxied by `app/v1/[...path]/route.ts` — no rewrites needed. */
const nextConfig: NextConfig = {};

export default nextConfig;

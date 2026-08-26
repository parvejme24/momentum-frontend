import { NextResponse, type NextRequest } from "next/server";

import { PAYMENT_RETURN_PATH } from "@/lib/billing/checkout";
import { REFRESH_COOKIE_NAME } from "@/lib/auth/constants";
import {
  isProtectedRoute,
  loginRedirectPath,
} from "@/lib/auth/protected-routes";

function shouldForwardPaymentReturn(request: NextRequest): boolean {
  const { pathname, searchParams } = request.nextUrl;
  const ssl = searchParams.get("sslcommerz");
  const checkout = searchParams.get("checkout");
  const sessionId = searchParams.get("session_id");

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return (
      ssl === "success" ||
      ssl === "fail" ||
      ssl === "cancel" ||
      checkout === "success" ||
      checkout === "cancel" ||
      Boolean(sessionId)
    );
  }

  if (pathname === "/subscription" || pathname.startsWith("/subscription/")) {
    return ssl === "fail" || ssl === "cancel" || checkout === "cancel";
  }

  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldForwardPaymentReturn(request)) {
    const url = request.nextUrl.clone();
    url.pathname = PAYMENT_RETURN_PATH;
    return NextResponse.redirect(url);
  }

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(REFRESH_COOKIE_NAME)?.value);
  if (hasSession) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(loginRedirectPath(pathname), request.url));
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/habits",
    "/habits/:path*",
    "/stats",
    "/stats/:path*",
    "/settings",
    "/settings/:path*",
    "/subscription",
    "/subscription/:path*",
    "/checkout",
    "/checkout/:path*",
    "/subscriptions",
    "/subscriptions/:path*",
    "/users",
    "/users/:path*",
    "/admin",
    "/admin/:path*",
    "/payments",
    "/payments/:path*",
    "/plans",
    "/plans/:path*",
    "/ai-prompts",
    "/ai-prompts/:path*",
    "/notifications",
    "/notifications/:path*",
  ],
};

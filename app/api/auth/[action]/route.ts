import { NextResponse } from "next/server";

import type { ApiErrorEnvelope, AuthResponse } from "@/lib/api/types";
import {
  clearRefreshToken,
  getRefreshToken,
  setRefreshToken,
} from "@/lib/auth/session";

type AuthAction = "login" | "register" | "refresh" | "logout";

const AUTH_ACTIONS = new Set<AuthAction>([
  "login",
  "register",
  "refresh",
  "logout",
]);

function apiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return base.replace(/\/$/, "");
}

function isAuthAction(value: string): value is AuthAction {
  return AUTH_ACTIONS.has(value as AuthAction);
}

function clientAuthPayload(data: AuthResponse) {
  return {
    user: data.user,
    accessToken: data.accessToken,
  };
}

async function forwardJson(
  path: string,
  body: unknown,
): Promise<{ res: Response; payload: unknown }> {
  const res = await fetch(`${apiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = { error: { code: "UNKNOWN", message: text, details: [] } };
    }
  }

  return { res, payload };
}

function errorResponse(status: number, payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload
  ) {
    return NextResponse.json(payload as ApiErrorEnvelope, { status });
  }

  return NextResponse.json(
    {
      error: {
        code: "UNKNOWN",
        message: "Upstream request failed",
        details: [],
      },
    } satisfies ApiErrorEnvelope,
    { status },
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;

  if (!isAuthAction(action)) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: `Unknown auth action: ${action}`,
          details: [],
        },
      } satisfies ApiErrorEnvelope,
      { status: 404 },
    );
  }

  try {
    if (action === "login" || action === "register") {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid JSON body",
              details: [],
            },
          } satisfies ApiErrorEnvelope,
          { status: 400 },
        );
      }

      const { res, payload } = await forwardJson(`/auth/${action}`, body);

      if (!res.ok) {
        return errorResponse(res.status, payload);
      }

      const data = payload as AuthResponse;
      if (
        typeof data !== "object" ||
        data === null ||
        typeof data.refreshToken !== "string" ||
        typeof data.accessToken !== "string"
      ) {
        return NextResponse.json(
          {
            error: {
              code: "UNKNOWN",
              message: "Invalid auth response from API",
              details: [],
            },
          } satisfies ApiErrorEnvelope,
          { status: 502 },
        );
      }

      await setRefreshToken(data.refreshToken);
      return NextResponse.json(clientAuthPayload(data));
    }

    if (action === "refresh") {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return NextResponse.json(
          {
            error: {
              code: "UNAUTHORIZED",
              message: "No session",
              details: [],
            },
          } satisfies ApiErrorEnvelope,
          { status: 401 },
        );
      }

      const { res, payload } = await forwardJson("/auth/refresh", {
        refreshToken,
      });

      if (!res.ok) {
        await clearRefreshToken();
        return errorResponse(res.status, payload);
      }

      const data = payload as AuthResponse;
      if (
        typeof data !== "object" ||
        data === null ||
        typeof data.refreshToken !== "string" ||
        typeof data.accessToken !== "string"
      ) {
        await clearRefreshToken();
        return NextResponse.json(
          {
            error: {
              code: "UNKNOWN",
              message: "Invalid refresh response from API",
              details: [],
            },
          } satisfies ApiErrorEnvelope,
          { status: 502 },
        );
      }

      await setRefreshToken(data.refreshToken);
      return NextResponse.json(clientAuthPayload(data));
    }

    // logout
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        await forwardJson("/auth/logout", { refreshToken });
      } catch {
        // Still clear the local cookie even if the upstream call fails.
      }
    }
    await clearRefreshToken();
    return new NextResponse(null, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "NETWORK_ERROR",
          message: "Failed to reach auth API",
          details: [],
        },
      } satisfies ApiErrorEnvelope,
      { status: 502 },
    );
  }
}

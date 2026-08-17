import { NextResponse } from "next/server";

import { authPath, getApiOrigin } from "@/lib/api/config";
import type { ApiErrorEnvelope, AuthResponse } from "@/lib/api/types";
import {
  clearRefreshToken,
  getRefreshToken,
  setRefreshToken,
} from "@/lib/auth/session";

type AuthAction =
  | "login"
  | "register"
  | "refresh"
  | "logout"
  | "logout-all"
  | "me"
  | "change-password"
  | "forgot-password"
  | "reset-password"
  | "verify-email"
  | "resend-verification";

const AUTH_ACTIONS = new Set<AuthAction>([
  "login",
  "register",
  "refresh",
  "logout",
  "logout-all",
  "me",
  "change-password",
  "forgot-password",
  "reset-password",
  "verify-email",
  "resend-verification",
]);

function isAuthAction(value: string): value is AuthAction {
  return AUTH_ACTIONS.has(value as AuthAction);
}

function clientAuthPayload(data: AuthResponse) {
  return {
    user: data.user,
    accessToken: data.accessToken,
  };
}

function errorResponse(status: number, payload: unknown) {
  if (typeof payload === "object" && payload !== null && "error" in payload) {
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

function invalidJson() {
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

function unknownAction(action: string) {
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

function networkError() {
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

function invalidAuthPayload() {
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

async function readJson(request: Request): Promise<unknown | NextResponse> {
  try {
    return await request.json();
  } catch {
    return invalidJson();
  }
}

async function forward(
  path: string,
  init: {
    method: string;
    body?: unknown;
    authorization?: string | null;
  },
): Promise<{ res: Response; payload: unknown }> {
  const headers = new Headers();
  if (init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (init.authorization) {
    headers.set("Authorization", init.authorization);
  }

  const res = await fetch(`${getApiOrigin()}${path}`, {
    method: init.method,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
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

function isAuthResponse(payload: unknown): payload is AuthResponse {
  if (typeof payload !== "object" || payload === null) return false;
  const data = payload as AuthResponse;
  return (
    typeof data.refreshToken === "string" &&
    typeof data.accessToken === "string" &&
    typeof data.user === "object" &&
    data.user !== null
  );
}

function authorizationFrom(request: Request) {
  return request.headers.get("authorization");
}

async function handleSessionAuth(action: "login" | "register", body: unknown) {
  const { res, payload } = await forward(authPath(action), {
    method: "POST",
    body,
  });

  if (!res.ok) return errorResponse(res.status, payload);
  if (!isAuthResponse(payload)) return invalidAuthPayload();

  await setRefreshToken(payload.refreshToken);
  return NextResponse.json(clientAuthPayload(payload));
}

async function handleRefresh() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({ user: null });
  }

  const { res, payload } = await forward(authPath("refresh"), {
    method: "POST",
    body: { refreshToken },
  });

  if (!res.ok || !isAuthResponse(payload)) {
    await clearRefreshToken();
    return NextResponse.json({ user: null });
  }

  await setRefreshToken(payload.refreshToken);
  return NextResponse.json(clientAuthPayload(payload));
}

async function handleLogout() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    try {
      await forward(authPath("logout"), {
        method: "POST",
        body: { refreshToken },
      });
    } catch {
      // Still clear the local cookie even if the upstream call fails.
    }
  }
  await clearRefreshToken();
  return new NextResponse(null, { status: 200 });
}

function passthrough(res: Response, payload: unknown) {
  if (!res.ok) return errorResponse(res.status, payload);
  if (res.status === 204 || payload == null) {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.json(payload, { status: res.status });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  if (!isAuthAction(action) || action !== "me") {
    return unknownAction(action);
  }

  try {
    const { res, payload } = await forward(authPath("me"), {
      method: "GET",
      authorization: authorizationFrom(request),
    });
    return passthrough(res, payload);
  } catch {
    return networkError();
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  if (!isAuthAction(action) || action !== "me") {
    return unknownAction(action);
  }

  const body = await readJson(request);
  if (body instanceof NextResponse) return body;

  try {
    const { res, payload } = await forward(authPath("me"), {
      method: "PATCH",
      body,
      authorization: authorizationFrom(request),
    });
    return passthrough(res, payload);
  } catch {
    return networkError();
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;

  if (!isAuthAction(action)) {
    return unknownAction(action);
  }

  try {
    if (action === "login" || action === "register") {
      const body = await readJson(request);
      if (body instanceof NextResponse) return body;
      return await handleSessionAuth(action, body);
    }

    if (action === "refresh") {
      return await handleRefresh();
    }

    if (action === "logout") {
      return await handleLogout();
    }

    if (action === "logout-all") {
      const { res, payload } = await forward(authPath("logout-all"), {
        method: "POST",
        authorization: authorizationFrom(request),
      });
      if (!res.ok) return errorResponse(res.status, payload);
      await clearRefreshToken();
      return new NextResponse(null, { status: 200 });
    }

    if (action === "change-password") {
      const body = await readJson(request);
      if (body instanceof NextResponse) return body;
      const { res, payload } = await forward(authPath("change-password"), {
        method: "POST",
        body,
        authorization: authorizationFrom(request),
      });
      return passthrough(res, payload);
    }

    if (
      action === "forgot-password" ||
      action === "reset-password" ||
      action === "verify-email"
    ) {
      const body = await readJson(request);
      if (body instanceof NextResponse) return body;
      const { res, payload } = await forward(authPath(action), {
        method: "POST",
        body,
      });
      return passthrough(res, payload);
    }

    if (action === "resend-verification") {
      const { res, payload } = await forward(authPath("resend-verification"), {
        method: "POST",
        authorization: authorizationFrom(request),
      });
      return passthrough(res, payload);
    }

    return unknownAction(action);
  } catch {
    return networkError();
  }
}

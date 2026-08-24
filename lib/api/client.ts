import { ApiError } from "@/lib/api/errors";
import { normalizeApiOrigin } from "@/lib/api/config";
import type { ApiErrorEnvelope, ClientAuthResponse } from "@/lib/api/types";

type JsonBody = Record<string, unknown> | unknown[] | null;

type RequestOptions = Omit<RequestInit, "body" | "method"> & {
  body?: JsonBody;
  /** Skip auth refresh/retry for this request. */
  skipAuthRetry?: boolean;
};

let accessToken: string | null = null;
let refreshPromise: Promise<ClientAuthResponse | null> | null = null;
let onSessionInvalid: (() => void) | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function setOnSessionInvalid(handler: (() => void) | null): void {
  onSessionInvalid = handler;
}

function apiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!base) {
    throw new ApiError({
      code: "INTERNAL_ERROR",
      message: "NEXT_PUBLIC_API_URL is not configured",
      status: 500,
    });
  }
  return normalizeApiOrigin(base);
}

function joinUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl()}${normalized}`;
}

function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("error" in value)) {
    return false;
  }
  const error = (value as { error: unknown }).error;
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const record = error as Record<string, unknown>;
  return typeof record.code === "string" && typeof record.message === "string";
}

async function parseErrorResponse(res: Response): Promise<ApiError> {
  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    return new ApiError({
      code: "UNKNOWN",
      message: res.statusText || "Request failed",
      status: res.status,
    });
  }

  if (isApiErrorEnvelope(payload)) {
    return new ApiError({
      code: payload.error.code,
      message: payload.error.message,
      status: res.status,
      details: Array.isArray(payload.error.details)
        ? payload.error.details
        : [],
    });
  }

  return new ApiError({
    code: "UNKNOWN",
    message: res.statusText || "Request failed",
    status: res.status,
  });
}

function invalidateSession(): void {
  accessToken = null;
  onSessionInvalid?.();
}

/**
 * Single-flight session refresh. Concurrent callers share one promise so
 * rotating refresh tokens never race.
 *
 * Returns null when there is no session — that is a normal logged-out
 * state, not a failed request.
 */
export async function refreshSession(): Promise<ClientAuthResponse | null> {
  refreshPromise ??= (async () => {
    let res: Response;
    try {
      res = await fetch("/api/auth/refresh", { method: "POST" });
    } catch {
      accessToken = null;
      throw new ApiError({
        code: "NETWORK_ERROR",
        message: "Network request failed",
        status: 0,
      });
    }

    if (!res.ok) {
      accessToken = null;
      throw await parseErrorResponse(res);
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      accessToken = null;
      throw new ApiError({
        code: "UNKNOWN",
        message: "Invalid refresh response",
        status: res.status,
      });
    }

    if (
      typeof data === "object" &&
      data !== null &&
      "user" in data &&
      (data as { user: unknown }).user === null
    ) {
      accessToken = null;
      return null;
    }

    if (
      typeof data !== "object" ||
      data === null ||
      typeof (data as ClientAuthResponse).accessToken !== "string" ||
      typeof (data as ClientAuthResponse).user !== "object" ||
      (data as ClientAuthResponse).user === null
    ) {
      accessToken = null;
      throw new ApiError({
        code: "UNKNOWN",
        message: "Invalid refresh response",
        status: res.status,
      });
    }

    const session = data as ClientAuthResponse;
    accessToken = session.accessToken;
    return session;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function refreshAccessToken(): Promise<string> {
  const session = await refreshSession();
  if (!session) {
    invalidateSession();
    throw new ApiError({
      code: "UNAUTHORIZED",
      message: "No session",
      status: 401,
    });
  }
  return session.accessToken;
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
  hasRetried = false,
): Promise<T> {
  const { body, skipAuthRetry, headers: initHeaders, ...rest } = options;

  const headers = new Headers(initHeaders);
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let res: Response;
  try {
    res = await fetch(joinUrl(path), {
      ...rest,
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: "Network request failed",
      status: 0,
    });
  }

  if (res.ok) {
    if (res.status === 204) {
      return undefined as T;
    }
    const text = await res.text();
    if (!text) {
      return undefined as T;
    }
    return JSON.parse(text) as T;
  }

  const error = await parseErrorResponse(res);

  if (
    (error.code === "TOKEN_EXPIRED" || error.code === "UNAUTHORIZED") &&
    !skipAuthRetry &&
    !hasRetried
  ) {
    try {
      await refreshAccessToken();
    } catch (refreshError) {
      invalidateSession();
      throw refreshError;
    }
    return request<T>(method, path, options, true);
  }

  if (error.code === "UNAUTHORIZED") {
    invalidateSession();
    throw error;
  }

  throw error;
}

export const api = {
  get<T>(path: string, init?: RequestOptions) {
    return request<T>("GET", path, init);
  },
  post<T>(path: string, body?: JsonBody, init?: RequestOptions) {
    return request<T>("POST", path, { ...init, body });
  },
  patch<T>(path: string, body?: JsonBody, init?: RequestOptions) {
    return request<T>("PATCH", path, { ...init, body });
  },
  put<T>(path: string, body?: JsonBody, init?: RequestOptions) {
    return request<T>("PUT", path, { ...init, body });
  },
  delete<T>(path: string, init?: RequestOptions) {
    return request<T>("DELETE", path, init);
  },
};

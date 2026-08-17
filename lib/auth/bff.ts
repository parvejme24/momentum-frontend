import { ApiError } from "@/lib/api/errors";
import { getAccessToken } from "@/lib/api/client";
import type {
  ChangePasswordRequest,
  ClientAuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateMeRequest,
  User,
} from "@/lib/api/types";

async function parseApiError(res: Response): Promise<ApiError> {
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

  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof (payload as { error: unknown }).error === "object" &&
    (payload as { error: unknown }).error !== null
  ) {
    const error = (
      payload as {
        error: {
          code: string;
          message: string;
          details?: { field?: string; message?: string }[];
        };
      }
    ).error;
    return new ApiError({
      code: error.code,
      message: error.message,
      status: res.status,
      details: error.details ?? [],
    });
  }

  return new ApiError({
    code: "UNKNOWN",
    message: res.statusText || "Request failed",
    status: res.status,
  });
}

async function authFetch(
  action: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    return await fetch(`/api/auth/${action}`, { ...init, headers });
  } catch {
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: "Network request failed",
      status: 0,
    });
  }
}

export function parseUserPayload(payload: unknown): User | null {
  if (typeof payload !== "object" || payload === null) return null;

  const record = payload as Record<string, unknown>;
  if (typeof record.user === "object" && record.user !== null) {
    return record.user as User;
  }
  if (typeof record.id === "string" && typeof record.email === "string") {
    return payload as User;
  }
  return null;
}

export async function postSessionAuth(
  action: "login" | "register",
  body: LoginRequest | RegisterRequest,
): Promise<ClientAuthResponse> {
  const res = await authFetch(action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw await parseApiError(res);
  return (await res.json()) as ClientAuthResponse;
}

export async function postLogout(): Promise<void> {
  await authFetch("logout", { method: "POST" });
}

export async function postLogoutAll(): Promise<void> {
  const res = await authFetch("logout-all", { method: "POST" });
  if (!res.ok) throw await parseApiError(res);
}

export async function fetchMe(): Promise<User> {
  const res = await authFetch("me", { method: "GET" });
  if (!res.ok) throw await parseApiError(res);
  const user = parseUserPayload(await res.json());
  if (!user) {
    throw new ApiError({
      code: "UNKNOWN",
      message: "Invalid profile response",
      status: 502,
    });
  }
  return user;
}

export async function patchMe(body: UpdateMeRequest): Promise<User> {
  const res = await authFetch("me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseApiError(res);
  const user = parseUserPayload(await res.json());
  if (!user) {
    throw new ApiError({
      code: "UNKNOWN",
      message: "Invalid profile response",
      status: 502,
    });
  }
  return user;
}

export async function postChangePassword(
  body: ChangePasswordRequest,
): Promise<void> {
  const res = await authFetch("change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseApiError(res);
}

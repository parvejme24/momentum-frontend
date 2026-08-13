"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  refreshSession,
  setAccessToken,
  setOnSessionInvalid,
} from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type {
  ClientAuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/lib/api/types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: Omit<RegisterRequest, "timezone"> & { timezone?: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function postAuth(
  action: "login" | "register" | "logout",
  body?: LoginRequest | RegisterRequest,
): Promise<ClientAuthResponse | null> {
  let res: Response;
  try {
    res = await fetch(`/api/auth/${action}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: "Network request failed",
      status: 0,
    });
  }

  if (action === "logout") {
    return null;
  }

  if (!res.ok) {
    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      throw new ApiError({
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
      throw new ApiError({
        code: error.code,
        message: error.message,
        status: res.status,
        details: error.details ?? [],
      });
    }

    throw new ApiError({
      code: "UNKNOWN",
      message: res.statusText || "Request failed",
      status: res.status,
    });
  }

  return (await res.json()) as ClientAuthResponse;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearLocalSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setOnSessionInvalid(() => {
      clearLocalSession();
      router.replace("/login");
    });
    return () => setOnSessionInvalid(null);
  }, [clearLocalSession, router]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const data = await refreshSession();
        if (cancelled) return;
        setUser(data.user);
      } catch {
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await postAuth("login", { email, password });
    if (!data) {
      throw new ApiError({
        code: "UNKNOWN",
        message: "Login failed",
        status: 500,
      });
    }
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (input: Omit<RegisterRequest, "timezone"> & { timezone?: string }) => {
      const timezone =
        input.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone;
      const data = await postAuth("register", {
        name: input.name,
        email: input.email,
        password: input.password,
        timezone,
      });
      if (!data) {
        throw new ApiError({
          code: "UNKNOWN",
          message: "Registration failed",
          status: 500,
        });
      }
      setAccessToken(data.accessToken);
      setUser(data.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await postAuth("logout");
    } finally {
      clearLocalSession();
      router.replace("/login");
    }
  }, [clearLocalSession, router]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

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
  ChangePasswordRequest,
  RegisterRequest,
  UpdateMeRequest,
  User,
} from "@/lib/api/types";
import {
  fetchMe,
  patchMe,
  postChangePassword,
  postLogout,
  postLogoutAll,
  postSessionAuth,
} from "@/lib/auth/bff";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    input: Omit<RegisterRequest, "timezone"> & { timezone?: string },
  ) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateMe: (input: UpdateMeRequest) => Promise<User>;
  changePassword: (input: ChangePasswordRequest) => Promise<void>;
  reloadMe: () => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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
    const data = await postSessionAuth("login", { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (input: Omit<RegisterRequest, "timezone"> & { timezone?: string }) => {
      const timezone =
        input.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const data = await postSessionAuth("register", {
        name: input.name,
        email: input.email,
        password: input.password,
        timezone,
      });
      setAccessToken(data.accessToken);
      setUser(data.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await postLogout();
    } finally {
      clearLocalSession();
      router.replace("/login");
    }
  }, [clearLocalSession, router]);

  const logoutAll = useCallback(async () => {
    await postLogoutAll();
    clearLocalSession();
    router.replace("/login");
  }, [clearLocalSession, router]);

  const updateMe = useCallback(async (input: UpdateMeRequest) => {
    const next = await patchMe(input);
    setUser(next);
    return next;
  }, []);

  const changePassword = useCallback(async (input: ChangePasswordRequest) => {
    await postChangePassword(input);
  }, []);

  const reloadMe = useCallback(async () => {
    const next = await fetchMe();
    setUser(next);
    return next;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        logoutAll,
        updateMe,
        changePassword,
        reloadMe,
      }}
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

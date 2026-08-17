"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  refreshSession,
  setAccessToken,
  setOnSessionInvalid,
} from "@/lib/api/client";
import type {
  ChangePasswordRequest,
  ClientAuthResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateMeRequest,
  User,
} from "@/lib/api/types";
import {
  fetchMe,
  patchMe,
  postChangePassword,
  postForgotPassword,
  postLogout,
  postLogoutAll,
  postResendVerification,
  postResetPassword,
  postSessionAuth,
  postVerifyEmail,
} from "@/lib/auth/bff";
import { authKeys } from "@/lib/auth/keys";

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
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (input: ResetPasswordRequest) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  reloadMe: () => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readSession(): Promise<ClientAuthResponse | null> {
  const data = await refreshSession();
  setAccessToken(data?.accessToken ?? null);
  return data;
}

function withUser(
  previous: ClientAuthResponse | null | undefined,
  user: User,
): ClientAuthResponse | null {
  if (!previous) return previous ?? null;
  return { ...previous, user };
}

function setSessionUser(queryClient: QueryClient, user: User) {
  queryClient.setQueryData<ClientAuthResponse | null>(authKeys.session(), (previous) =>
    withUser((previous ?? null) as ClientAuthResponse | null, user),
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: authKeys.session(),
    queryFn: readSession,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const applySession = useCallback(
    (data: ClientAuthResponse) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(authKeys.session(), data);
    },
    [queryClient],
  );

  const clearSession = useCallback(() => {
    setAccessToken(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setOnSessionInvalid(() => {
      setAccessToken(null);
      queryClient.setQueryData(authKeys.session(), null);
    });
    return () => setOnSessionInvalid(null);
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: (body: LoginRequest) => postSessionAuth("login", body),
    onSuccess: applySession,
  });

  const registerMutation = useMutation({
    mutationFn: (body: RegisterRequest) => postSessionAuth("register", body),
    onSuccess: applySession,
  });

  const logoutMutation = useMutation({
    mutationFn: postLogout,
    onSettled: () => {
      clearSession();
      router.replace("/login");
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: postLogoutAll,
    onSuccess: () => {
      clearSession();
      router.replace("/login");
    },
  });

  const updateMeMutation = useMutation({
    mutationFn: patchMe,
    onSuccess: (user) => {
      setSessionUser(queryClient, user);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: postChangePassword,
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: postForgotPassword,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: postResetPassword,
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => postVerifyEmail({ token }),
    onSuccess: async () => {
      try {
        const user = await fetchMe();
        setSessionUser(queryClient, user);
      } catch {
        queryClient.setQueryData(
          authKeys.session(),
          (previous: ClientAuthResponse | null | undefined) => {
            if (!previous) return previous;
            return {
              ...previous,
              user: { ...previous.user, emailVerified: true },
            };
          },
        );
      }
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: postResendVerification,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    [loginMutation.mutateAsync],
  );

  const register = useCallback(
    async (input: Omit<RegisterRequest, "timezone"> & { timezone?: string }) => {
      const timezone =
        input.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      await registerMutation.mutateAsync({
        name: input.name,
        email: input.email,
        password: input.password,
        timezone,
      });
    },
    [registerMutation.mutateAsync],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation.mutateAsync]);

  const logoutAll = useCallback(async () => {
    await logoutAllMutation.mutateAsync();
  }, [logoutAllMutation.mutateAsync]);

  const updateMe = useCallback(
    async (input: UpdateMeRequest) => updateMeMutation.mutateAsync(input),
    [updateMeMutation.mutateAsync],
  );

  const changePassword = useCallback(
    async (input: ChangePasswordRequest) => {
      await changePasswordMutation.mutateAsync(input);
    },
    [changePasswordMutation.mutateAsync],
  );

  const forgotPassword = useCallback(
    async (email: string) => {
      await forgotPasswordMutation.mutateAsync({ email });
    },
    [forgotPasswordMutation.mutateAsync],
  );

  const resetPassword = useCallback(
    async (input: ResetPasswordRequest) => {
      await resetPasswordMutation.mutateAsync(input);
    },
    [resetPasswordMutation.mutateAsync],
  );

  const verifyEmail = useCallback(
    async (token: string) => {
      await verifyEmailMutation.mutateAsync(token);
    },
    [verifyEmailMutation.mutateAsync],
  );

  const resendVerification = useCallback(async () => {
    await resendVerificationMutation.mutateAsync();
  }, [resendVerificationMutation.mutateAsync]);

  const reloadMe = useCallback(async () => {
    const user = await fetchMe();
    setSessionUser(queryClient, user);
    return user;
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: sessionQuery.data?.user ?? null,
        isLoading: sessionQuery.isPending,
        login,
        register,
        logout,
        logoutAll,
        updateMe,
        changePassword,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
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

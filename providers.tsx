"use client";

import { useState, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { ToastProvider } from "@/components/auth/toast";
import { ThemeProvider } from "@/components/theme-provider";
import { ApiError } from "@/lib/api/errors";
import { AuthProvider } from "@/lib/auth/context";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Prefer cached UI — feels instant while background refresh stays quiet.
        staleTime: 60_000,
        gcTime: 10 * 60_000,
        retry: (count, err) =>
          err instanceof ApiError &&
          ["UNAUTHORIZED", "TOKEN_EXPIRED", "NOT_FOUND"].includes(err.code)
            ? false
            : count < 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

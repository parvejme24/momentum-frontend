"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getAiFeatures,
  getAiStatus,
  postAiChat,
  postAiCreateHabit,
  postAiHabitIdeas,
  postAiHabitMessage,
  postAiSuggestions,
} from "@/lib/api/ai";
import type {
  AiChatInput,
  AiCreateHabitInput,
  AiFocus,
  AiHabitIdeasInput,
  AiHabitMessageInput,
} from "@/lib/api/types";
import { ApiError } from "@/lib/api/errors";
import { aiKeys } from "@/lib/ai/keys";
import { useAuth } from "@/lib/auth/context";

function shouldRetryAi(count: number, err: unknown) {
  if (
    err instanceof ApiError &&
    ["RATE_LIMITED", "UNAUTHORIZED", "TOKEN_EXPIRED"].includes(err.code)
  ) {
    return false;
  }
  return count < 1;
}

export function useAiStatus() {
  const { user, isLoading } = useAuth();
  return useQuery({
    queryKey: aiKeys.status(),
    queryFn: getAiStatus,
    enabled: !isLoading && Boolean(user),
    staleTime: 60_000,
    retry: shouldRetryAi,
  });
}

export function useAiFeatures() {
  const { user, isLoading } = useAuth();
  return useQuery({
    queryKey: aiKeys.features(),
    queryFn: getAiFeatures,
    enabled: !isLoading && Boolean(user),
    staleTime: 60_000,
    retry: shouldRetryAi,
  });
}

/** Cached suggestions — avoids the old mutation + effect loop that rate-limited the API. */
export function useAiSuggestions(focus: AiFocus, enabled: boolean) {
  return useQuery({
    queryKey: aiKeys.suggestions(focus),
    queryFn: () => postAiSuggestions({ focus }),
    enabled,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: shouldRetryAi,
  });
}

export function useAiHabitIdeas() {
  return useMutation({
    mutationFn: (body: AiHabitIdeasInput) => postAiHabitIdeas(body),
  });
}

export function useAiHabitMessage() {
  return useMutation({
    mutationFn: (body: AiHabitMessageInput) => postAiHabitMessage(body),
  });
}

export function useAiChat() {
  return useMutation({
    mutationFn: (body: AiChatInput) => postAiChat(body),
  });
}

export function useAiCreateHabit() {
  return useMutation({
    mutationFn: (body: AiCreateHabitInput) => postAiCreateHabit(body),
  });
}

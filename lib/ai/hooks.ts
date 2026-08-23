"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getAiStatus,
  postAiHabitIdeas,
  postAiHabitMessage,
  postAiSuggestions,
} from "@/lib/api/ai";
import type {
  AiHabitIdeasInput,
  AiHabitMessageInput,
  AiSuggestionsInput,
} from "@/lib/api/types";
import { aiKeys } from "@/lib/ai/keys";
import { useAuth } from "@/lib/auth/context";

export function useAiStatus() {
  const { user, isLoading } = useAuth();
  return useQuery({
    queryKey: aiKeys.status(),
    queryFn: getAiStatus,
    enabled: !isLoading && Boolean(user),
    staleTime: 60_000,
  });
}

export function useAiSuggestions() {
  return useMutation({
    mutationFn: (body: AiSuggestionsInput) => postAiSuggestions(body),
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

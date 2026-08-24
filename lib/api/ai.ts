import { api } from "@/lib/api/client";
import { aiPath } from "@/lib/api/config";
import type {
  AiChatInput,
  AiChatResponse,
  AiCreateHabitInput,
  AiCreateHabitResponse,
  AiFeaturesResponse,
  AiHabitIdeasInput,
  AiHabitIdeasResponse,
  AiHabitMessageInput,
  AiHabitMessageResponse,
  AiStatusResponse,
  AiSuggestionsInput,
  AiSuggestionsResponse,
} from "@/lib/api/types";

export async function getAiStatus(): Promise<AiStatusResponse> {
  return api.get<AiStatusResponse>(aiPath("status"));
}

export async function getAiFeatures(): Promise<AiFeaturesResponse> {
  return api.get<AiFeaturesResponse>(aiPath("features"));
}

export async function postAiSuggestions(
  body: AiSuggestionsInput,
): Promise<AiSuggestionsResponse> {
  return api.post<AiSuggestionsResponse>(
    aiPath("suggestions"),
    body as Record<string, unknown>,
  );
}

export async function postAiHabitIdeas(
  body: AiHabitIdeasInput,
): Promise<AiHabitIdeasResponse> {
  return api.post<AiHabitIdeasResponse>(
    aiPath("habit-ideas"),
    body as Record<string, unknown>,
  );
}

export async function postAiHabitMessage(
  body: AiHabitMessageInput,
): Promise<AiHabitMessageResponse> {
  return api.post<AiHabitMessageResponse>(
    aiPath("habit-message"),
    body as Record<string, unknown>,
  );
}

export async function postAiChat(body: AiChatInput): Promise<AiChatResponse> {
  return api.post<AiChatResponse>(aiPath("chat"), body as Record<string, unknown>);
}

export async function postAiCreateHabit(
  body: AiCreateHabitInput,
): Promise<AiCreateHabitResponse> {
  return api.post<AiCreateHabitResponse>(
    aiPath("create-habit"),
    body as Record<string, unknown>,
  );
}

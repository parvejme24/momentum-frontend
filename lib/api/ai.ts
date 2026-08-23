import { api } from "@/lib/api/client";
import { aiPath } from "@/lib/api/config";
import type {
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

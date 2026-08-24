import { api } from "@/lib/api/client";
import { adminAiPath, queryString } from "@/lib/api/config";
import type {
  AdminAiPrompt,
  CreateAiPromptInput,
  ListAdminAiPromptsQuery,
  UpdateAiPromptInput,
} from "@/lib/api/types";

export async function listAdminAiPrompts(
  query: ListAdminAiPromptsQuery = {},
): Promise<AdminAiPrompt[]> {
  const payload = await api.get<{ prompts: AdminAiPrompt[] }>(
    `${adminAiPath("prompts")}${queryString({
      feature: query.feature,
      status: query.status,
    })}`,
  );
  return Array.isArray(payload.prompts) ? payload.prompts : [];
}

export async function getAdminAiPrompt(id: string): Promise<AdminAiPrompt> {
  const payload = await api.get<{ prompt: AdminAiPrompt }>(
    adminAiPath(`prompts/${id}`),
  );
  return payload.prompt;
}

export async function createAdminAiPrompt(
  body: CreateAiPromptInput,
): Promise<AdminAiPrompt> {
  const payload = await api.post<{ prompt: AdminAiPrompt }>(
    adminAiPath("prompts"),
    body as Record<string, unknown>,
  );
  return payload.prompt;
}

export async function updateAdminAiPrompt(
  id: string,
  body: UpdateAiPromptInput,
): Promise<AdminAiPrompt> {
  const payload = await api.patch<{ prompt: AdminAiPrompt }>(
    adminAiPath(`prompts/${id}`),
    body as Record<string, unknown>,
  );
  return payload.prompt;
}

export async function publishAdminAiPrompt(id: string): Promise<AdminAiPrompt> {
  const payload = await api.post<{ prompt: AdminAiPrompt }>(
    adminAiPath(`prompts/${id}/publish`),
  );
  return payload.prompt;
}

export async function archiveAdminAiPrompt(id: string): Promise<AdminAiPrompt> {
  const payload = await api.post<{ prompt: AdminAiPrompt }>(
    adminAiPath(`prompts/${id}/archive`),
  );
  return payload.prompt;
}

export async function deleteAdminAiPrompt(id: string): Promise<void> {
  await api.delete(adminAiPath(`prompts/${id}`));
}

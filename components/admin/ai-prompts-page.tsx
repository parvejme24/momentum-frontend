"use client";

import { useMemo, useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { RoleGate } from "@/components/app/role-gate";
import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { ConfirmSheet } from "@/components/settings/confirm-sheet";
import { AdminListPageSkeleton } from "@/components/ui/page-skeletons";
import { QueryError } from "@/components/ui/query-error";
import {
  useAdminAiPrompts,
  useArchiveAdminAiPrompt,
  useCreateAdminAiPrompt,
  useDeleteAdminAiPrompt,
  usePublishAdminAiPrompt,
  useUpdateAdminAiPrompt,
} from "@/lib/admin/hooks";
import { mutationErrorMessage } from "@/lib/admin/map";
import {
  AI_PROMPT_FEATURES,
  aiPromptFeatureLabel,
  aiPromptStatusChip,
  aiPromptStatusLabel,
} from "@/lib/ai/map";
import type {
  AdminAiPrompt,
  AiPromptFeature,
  AiPromptStatus,
} from "@/lib/api/types";
import { isAdmin } from "@/lib/auth/role";
import { useAuth } from "@/lib/auth/context";
import { formatPrettyIso } from "@/lib/dates";

const STATUS_TABS: Array<{ id: AiPromptStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Draft" },
  { id: "archived", label: "Archived" },
];

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  feature: "suggestions" as AiPromptFeature,
  body: "",
  sortOrder: "0",
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function AiPromptsPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const admin = isAdmin(user);

  const [status, setStatus] = useState<AiPromptStatus | "all">("all");
  const [feature, setFeature] = useState<AiPromptFeature | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAiPrompt | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AdminAiPrompt | null>(null);

  const listQuery = useMemo(
    () => ({
      status,
      feature: feature === "all" ? undefined : feature,
    }),
    [feature, status],
  );

  const promptsQuery = useAdminAiPrompts(listQuery);
  const createPrompt = useCreateAdminAiPrompt();
  const updatePrompt = useUpdateAdminAiPrompt();
  const publishPrompt = usePublishAdminAiPrompt();
  const archivePrompt = useArchiveAdminAiPrompt();
  const deletePrompt = useDeleteAdminAiPrompt();
  const prompts = promptsQuery.data ?? [];

  const featureHelp =
    AI_PROMPT_FEATURES.find((item) => item.id === form.feature)?.vars ?? "";

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(prompt: AdminAiPrompt) {
    setEditing(prompt);
    setForm({
      name: prompt.name,
      slug: prompt.slug,
      description: prompt.description ?? "",
      feature: prompt.feature,
      body: prompt.body,
      sortOrder: String(prompt.sortOrder),
    });
    setFormOpen(true);
  }

  async function save() {
    if (!form.name.trim() || !form.slug.trim() || form.body.trim().length < 20) {
      pushToast("Name, slug, and a prompt body (20+ chars) are required");
      return;
    }
    try {
      if (editing) {
        await updatePrompt.mutateAsync({
          id: editing.id,
          body: {
            name: form.name.trim(),
            slug: form.slug.trim(),
            description: form.description.trim() || null,
            feature: form.feature,
            body: form.body.trim(),
            sortOrder: Number(form.sortOrder) || 0,
          },
        });
        pushToast("Prompt updated");
      } else {
        await createPrompt.mutateAsync({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
          feature: form.feature,
          body: form.body.trim(),
          sortOrder: Number(form.sortOrder) || 0,
        });
        pushToast("Prompt created as draft");
      }
      setFormOpen(false);
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not save prompt"));
    }
  }

  async function publish(id: string) {
    try {
      await publishPrompt.mutateAsync(id);
      pushToast("Prompt published");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not publish"));
    }
  }

  async function archive(id: string) {
    try {
      await archivePrompt.mutateAsync(id);
      pushToast("Prompt archived");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not archive"));
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    try {
      await deletePrompt.mutateAsync(deleteTarget.id);
      pushToast(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not delete prompt"));
    }
  }

  return (
    <RoleGate
      allowed={admin}
      title="AI prompts"
      message="This screen is for Momentum admins."
    >
      <MotionConfig reducedMotion="user">
        <motion.div
          className="users-page"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={reduce ? undefined : staggerContainer}
        >
          {promptsQuery.isLoading ? (
            <AdminListPageSkeleton rows={6} tabs={4} withSearch={false} withAction />
          ) : (
            <>
              <motion.header
                className="page-head row-between"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div>
                  <p className="eyebrow">AI</p>
                  <h1>AI prompts</h1>
                  <p className="lede" style={{ marginTop: 10, maxWidth: "48ch" }}>
                    Draft and publish the Gemini prompt templates used for chat,
                    habit ideas, suggestions, and coach messages.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={openCreate}
                >
                  New prompt
                </button>
              </motion.header>

              <QueryError error={promptsQuery.error} />

              <motion.div
                className="users-toolbar"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div className="tab-bar" role="tablist" aria-label="Prompt status">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={status === tab.id}
                      className={status === tab.id ? "tab active" : "tab"}
                      onClick={() => setStatus(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <label className="field ai-prompt-feature-filter">
                  <span className="label">Feature</span>
                  <select
                    className="select"
                    value={feature}
                    onChange={(event) =>
                      setFeature(event.target.value as AiPromptFeature | "all")
                    }
                  >
                    <option value="all">All features</option>
                    {AI_PROMPT_FEATURES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </motion.div>

              <motion.ul
                className="admin-prompt-list"
                variants={reduce ? undefined : fadeUpSoft}
              >
                {prompts.map((prompt) => (
                  <li key={prompt.id} className="card admin-prompt-card">
                    <div className="admin-prompt-top">
                      <div>
                        <h2 className="section-title">{prompt.name}</h2>
                        <p className="mono users-email">
                          {prompt.slug} · {aiPromptFeatureLabel(prompt.feature)}
                        </p>
                      </div>
                      <span className={aiPromptStatusChip(prompt.status)}>
                        {aiPromptStatusLabel(prompt.status)}
                      </span>
                    </div>
                    {prompt.description ? (
                      <p className="hint">{prompt.description}</p>
                    ) : null}
                    <pre className="admin-prompt-body mono">{prompt.body}</pre>
                    <p className="hint mono">
                      Updated {formatPrettyIso(prompt.updatedAt)}
                      {prompt.publishedAt
                        ? ` · Published ${formatPrettyIso(prompt.publishedAt)}`
                        : ""}
                    </p>
                    <div className="users-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(prompt)}
                      >
                        Edit
                      </button>
                      {prompt.status !== "published" ? (
                        <button
                          type="button"
                          className="btn btn-sm"
                          disabled={publishPrompt.isPending}
                          onClick={() => void publish(prompt.id)}
                        >
                          Publish
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={archivePrompt.isPending}
                          onClick={() => void archive(prompt.id)}
                        >
                          Archive
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDeleteTarget(prompt)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </motion.ul>
              {prompts.length === 0 ? (
                <p className="hint">No prompts in this filter.</p>
              ) : null}
            </>
          )}

          <ConfirmSheet
            open={formOpen}
            onClose={() => setFormOpen(false)}
            title={editing ? `Edit ${editing.name}` : "New AI prompt"}
          >
            <label className="field" style={{ marginTop: 16 }}>
              <span className="label">Name</span>
              <input
                className="input"
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug: editing ? prev.slug : slugify(name),
                  }));
                }}
              />
            </label>
            <label className="field">
              <span className="label">Slug</span>
              <input
                className="input"
                value={form.slug}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, slug: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span className="label">Feature</span>
              <select
                className="select"
                value={form.feature}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    feature: event.target.value as AiPromptFeature,
                  }))
                }
              >
                {AI_PROMPT_FEATURES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Description</span>
              <input
                className="input"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </label>
            <label className="field">
              <span className="label">Prompt body</span>
              <textarea
                className="input"
                rows={10}
                value={form.body}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, body: event.target.value }))
                }
              />
            </label>
            <p className="hint mono">Vars: {featureHelp}</p>
            <label className="field">
              <span className="label">Sort order</span>
              <input
                className="input"
                inputMode="numeric"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    sortOrder: event.target.value,
                  }))
                }
              />
            </label>
            <div className="settings-actions" style={{ marginTop: 22 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={createPrompt.isPending || updatePrompt.isPending}
                onClick={() => void save()}
              >
                {editing ? "Save" : "Create draft"}
              </button>
            </div>
          </ConfirmSheet>

          <ConfirmSheet
            open={Boolean(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            title={`Delete ${deleteTarget?.name}?`}
          >
            <p className="hint" style={{ marginTop: 10, lineHeight: 1.55 }}>
              Published prompts must be archived before they can be deleted.
            </p>
            <div className="settings-actions" style={{ marginTop: 22 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deletePrompt.isPending}
                onClick={() => void remove()}
              >
                Delete
              </button>
            </div>
          </ConfirmSheet>
        </motion.div>
      </MotionConfig>
    </RoleGate>
  );
}

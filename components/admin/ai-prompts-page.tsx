"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { RoleGate } from "@/components/app/role-gate";
import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { AdminListPageSkeleton } from "@/components/ui/page-skeletons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  btn,
  btnDanger,
  btnGhost,
  btnPrimary,
  btnSm,
  card,
  dialogBtn,
  eyebrow,
  hint,
  lede,
  mono,
  pageHead,
  rowBetween,
  sectionTitle,
  tabBar,
  tabs,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

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

const FEATURE_OPTIONS = AI_PROMPT_FEATURES.map((item) => ({
  value: item.id,
  label: item.label,
}));

const FILTER_FEATURE_OPTIONS = [
  { value: "all", label: "All features" },
  ...FEATURE_OPTIONS.map(({ value, label }) => ({ value, label })),
];

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
          className="min-w-0"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={reduce ? undefined : staggerContainer}
        >
          {promptsQuery.isLoading ? (
            <AdminListPageSkeleton rows={6} tabs={4} withSearch={false} withAction />
          ) : (
            <>
              <motion.header
                className={cn(pageHead, rowBetween)}
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div>
                  <p className={cn(eyebrow, "mb-2")}>AI</p>
                  <h1>AI prompts</h1>
                  <p className={cn(lede, "mt-2.5 max-w-[48ch]")}>
                    Draft and publish the Gemini prompt templates used for chat,
                    habit ideas, suggestions, and coach messages.
                  </p>
                </div>
                <button
                  type="button"
                  className={cn(btn, btnPrimary, btnSm)}
                  onClick={openCreate}
                >
                  New prompt
                </button>
              </motion.header>

              <QueryError error={promptsQuery.error} />

              <motion.div
                className="mb-[18px] flex flex-wrap items-end justify-between gap-4"
                variants={reduce ? undefined : fadeUpSoft}
              >
                <div className={tabBar} role="tablist" aria-label="Prompt status">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={status === tab.id}
                      className={tabs(status === tab.id)}
                      onClick={() => setStatus(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="min-w-45">
                  <Label htmlFor="prompt-feature-filter" className="mb-2">
                    Feature
                  </Label>
                  <DropdownSelect
                    id="prompt-feature-filter"
                    value={feature}
                    onChange={(value) =>
                      setFeature(value as AiPromptFeature | "all")
                    }
                    placeholder="All features"
                    aria-label="Feature"
                    options={FILTER_FEATURE_OPTIONS}
                  />
                </div>
              </motion.div>

              <motion.ul
                className="m-0 grid list-none gap-4 p-0"
                variants={reduce ? undefined : fadeUpSoft}
              >
                {prompts.map((prompt) => (
                  <li key={prompt.id} className={cn(card, "grid gap-3")}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className={sectionTitle}>{prompt.name}</h2>
                        <p className={cn(mono, "mt-0.5 text-[0.72rem] text-ink-50")}>
                          {prompt.slug} · {aiPromptFeatureLabel(prompt.feature)}
                        </p>
                      </div>
                      <span className={aiPromptStatusChip(prompt.status)}>
                        {aiPromptStatusLabel(prompt.status)}
                      </span>
                    </div>
                    {prompt.description ? (
                      <p className={hint}>{prompt.description}</p>
                    ) : null}
                    <pre
                      className={cn(
                        mono,
                        "m-0 max-h-[180px] overflow-auto whitespace-pre-wrap break-words border border-ink/10 bg-paper p-3 text-[0.78rem] leading-normal",
                      )}
                    >
                      {prompt.body}
                    </pre>
                    <p className={cn(hint, mono)}>
                      Updated {formatPrettyIso(prompt.updatedAt)}
                      {prompt.publishedAt
                        ? ` · Published ${formatPrettyIso(prompt.publishedAt)}`
                        : ""}
                    </p>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        className={cn(btn, btnGhost, btnSm)}
                        onClick={() => openEdit(prompt)}
                      >
                        Edit
                      </button>
                      {prompt.status !== "published" ? (
                        <button
                          type="button"
                          className={cn(btn, btnSm)}
                          disabled={publishPrompt.isPending}
                          onClick={() => void publish(prompt.id)}
                        >
                          Publish
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={cn(btn, btnGhost, btnSm)}
                          disabled={archivePrompt.isPending}
                          onClick={() => void archive(prompt.id)}
                        >
                          Archive
                        </button>
                      )}
                      <button
                        type="button"
                        className={cn(btn, btnGhost, btnSm)}
                        onClick={() => setDeleteTarget(prompt)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </motion.ul>
              {prompts.length === 0 ? (
                <p className={hint}>No prompts in this filter.</p>
              ) : null}
            </>
          )}

          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? `Edit ${editing.name}` : "New AI prompt"}
                </DialogTitle>
                <DialogDescription>
                  {editing
                    ? "Update the template used for this AI feature."
                    : "Draft a Gemini prompt template. Publish it when it is ready."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid max-h-[min(70vh,36rem)] gap-4 overflow-y-auto pr-0.5">
                <div className="grid gap-2">
                  <Label htmlFor="prompt-name">Name</Label>
                  <Input
                    id="prompt-name"
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
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prompt-slug">Slug</Label>
                  <Input
                    id="prompt-slug"
                    value={form.slug}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, slug: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prompt-feature">Feature</Label>
                  <DropdownSelect
                    id="prompt-feature"
                    value={form.feature}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        feature: value as AiPromptFeature,
                      }))
                    }
                    placeholder="Choose feature"
                    aria-label="Feature"
                    icon={Sparkles}
                    options={FEATURE_OPTIONS}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prompt-description">Description</Label>
                  <Input
                    id="prompt-description"
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prompt-body">Prompt body</Label>
                  <Textarea
                    id="prompt-body"
                    rows={10}
                    value={form.body}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, body: event.target.value }))
                    }
                  />
                  <p className={cn(hint, mono)}>Vars: {featureHelp}</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prompt-sort">Sort order</Label>
                  <Input
                    id="prompt-sort"
                    inputMode="numeric"
                    value={form.sortOrder}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        sortOrder: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  className={cn(dialogBtn, btnGhost)}
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={cn(dialogBtn, btnPrimary)}
                  disabled={createPrompt.isPending || updatePrompt.isPending}
                  onClick={() => void save()}
                >
                  {editing ? "Save" : "Create draft"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {deleteTarget
                    ? `Delete ${deleteTarget.name}?`
                    : "Delete prompt?"}
                </DialogTitle>
                <DialogDescription className="leading-relaxed">
                  Published prompts must be archived before they can be deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <button
                  type="button"
                  className={cn(dialogBtn, btnGhost)}
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={cn(dialogBtn, btnDanger)}
                  disabled={deletePrompt.isPending}
                  onClick={() => void remove()}
                >
                  Delete
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </MotionConfig>
    </RoleGate>
  );
}

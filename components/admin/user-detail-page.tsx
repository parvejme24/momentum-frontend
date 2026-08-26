"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import { RoleGate } from "@/components/app/role-gate";
import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { ConfirmSheet } from "@/components/settings/confirm-sheet";
import { UserDetailSkeleton } from "@/components/ui/page-skeletons";
import { QueryError } from "@/components/ui/query-error";
import {
  useAdminUser,
  useBanAdminUser,
  useDeleteAdminUser,
  useGrantAdminUserAccess,
  useRestoreAdminUser,
  useTrashAdminUser,
  useUnbanAdminUser,
  useUpdateAdminUser,
} from "@/lib/admin/hooks";
import {
  accountStatusChip,
  accountStatusLabel,
  formatLastActive,
  initialFromName,
  mutationErrorMessage,
  paymentStatusChip,
  paymentStatusLabel,
  subscriptionStatusChip,
  subscriptionStatusLabel,
} from "@/lib/admin/map";
import type { GrantPlanAccessInput, UserRole } from "@/lib/api/types";
import { isAdmin } from "@/lib/auth/role";
import { useAuth } from "@/lib/auth/context";
import { formatPrettyIso } from "@/lib/dates";
import { formatCents } from "@/lib/money";
import {
  avatar,
  btn,
  btnDanger,
  btnGhost,
  btnPrimary,
  card,
  eyebrow,
  field,
  fieldRow,
  hint,
  inlineLink,
  input,
  label,
  lede,
  mono,
  pageHead,
  panelHead,
  rowBetween,
  sectionTitle,
  select,
  settingsActions,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

type ConfirmKind = "ban" | "unban" | "trash" | "restore" | "delete" | null;

const FEED = "m-0 list-none p-0";
const FEED_ITEM =
  "flex items-center gap-3 border-b border-ink/8 py-3 last:border-b-0 last:pb-0 dark:border-[rgba(221,216,207,0.08)]";
const FEED_COPY = "min-w-0 flex-1";
const PERSON_NAME = "font-bold tracking-[-0.01em]";
const PERSON_META = cn(mono, "mt-0.5 text-[0.72rem] text-ink-50");
const FIELD_IN_ROW = cn(field, "m-0 flex min-w-0 flex-col gap-[7px]");

export function UserDetailPage() {
  const reduce = useReducedMotion();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { pushToast } = useToast();
  const { user: me } = useAuth();
  const admin = isAdmin(me);

  const detailQuery = useAdminUser(id);
  const updateUser = useUpdateAdminUser(id);
  const banUser = useBanAdminUser();
  const unbanUser = useUnbanAdminUser();
  const trashUser = useTrashAdminUser();
  const restoreUser = useRestoreAdminUser();
  const deleteUser = useDeleteAdminUser();
  const grantAccess = useGrantAdminUserAccess();

  const detail = detailQuery.data;
  const person = detail?.user;

  const [form, setForm] = useState<{ id: string; name: string; role: UserRole }>({
    id: "",
    name: "",
    role: "customer",
  });
  const [grantForm, setGrantForm] = useState<GrantPlanAccessInput>({
    planSlug: "pro-year",
    accessType: "timed",
    days: 365,
    notes: "",
  });
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const [banReason, setBanReason] = useState("");

  const name = form.id === person?.id ? form.name : (person?.name ?? "");
  const role = form.id === person?.id ? form.role : (person?.role ?? "customer");

  const busy =
    updateUser.isPending ||
    banUser.isPending ||
    unbanUser.isPending ||
    trashUser.isPending ||
    restoreUser.isPending ||
    deleteUser.isPending ||
    grantAccess.isPending;

  async function saveProfile() {
    try {
      await updateUser.mutateAsync({ name: name.trim(), role });
      pushToast("Account updated");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not update account"));
    }
  }

  async function grantProAccess() {
    if (!person) return;
    try {
      await grantAccess.mutateAsync({
        id: person.id,
        body: {
          planSlug: grantForm.planSlug,
          accessType: grantForm.accessType,
          ...(grantForm.accessType === "timed"
            ? { days: grantForm.days ?? 365 }
            : {}),
          ...(grantForm.notes?.trim()
            ? { notes: grantForm.notes.trim() }
            : {}),
        },
      });
      pushToast(`Pro access granted to ${person.name}`);
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not grant access"));
    }
  }

  async function runConfirm() {
    if (!person || !confirm) return;
    try {
      if (confirm === "ban") {
        await banUser.mutateAsync({
          id: person.id,
          body: banReason.trim() ? { reason: banReason.trim() } : {},
        });
        pushToast(`${person.name} banned`);
      } else if (confirm === "unban") {
        await unbanUser.mutateAsync(person.id);
        pushToast(`${person.name} restored`);
      } else if (confirm === "trash") {
        await trashUser.mutateAsync(person.id);
        pushToast(`${person.name} moved to trash`);
      } else if (confirm === "restore") {
        await restoreUser.mutateAsync(person.id);
        pushToast(`${person.name} restored`);
      } else {
        await deleteUser.mutateAsync(person.id);
        pushToast(`${person.name} deleted`);
        router.push("/users");
      }
      setConfirm(null);
      setBanReason("");
    } catch (error) {
      pushToast(mutationErrorMessage(error, "Could not update this account"));
    }
  }

  return (
    <RoleGate
      allowed={admin}
      title="Users"
      message="This screen is for Momentum admins. Your account doesn’t have access."
    >
      {detailQuery.isLoading ? (
        <UserDetailSkeleton />
      ) : (
        <MotionConfig reducedMotion="user">
          <motion.div
            className="min-w-0"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={reduce ? undefined : staggerContainer}
          >
            <motion.header
              className={cn(pageHead, rowBetween)}
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div>
                <p className={cn(eyebrow, "mb-2")}>
                  <Link href="/users" className={inlineLink}>
                    Users
                  </Link>
                </p>
                <h1>{person?.name ?? "User"}</h1>
                <p className={cn(lede, "mt-2.5")}>{person?.email}</p>
              </div>
              {person ? (
                <span className={accountStatusChip(person.status)}>
                  {accountStatusLabel(person.status)}
                </span>
              ) : null}
            </motion.header>

            <QueryError error={detailQuery.error} fallback="Could not load this user" />

            {!person ? (
              <p className={hint}>User not found.</p>
            ) : (
              <>
                <motion.section
                  className={card}
                  variants={reduce ? undefined : fadeUpSoft}
                >
                  <div className={panelHead}>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={avatar} aria-hidden>
                        {initialFromName(person.name)}
                      </div>
                      <div>
                        <h2 className={sectionTitle}>Account</h2>
                        <p className={cn(hint, "mt-1")}>
                          Last active {formatLastActive(person.lastActiveAt)} ·
                          joined {formatPrettyIso(person.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={cn(fieldRow, "mt-2")}>
                    <label className={FIELD_IN_ROW}>
                      <span className={label}>Name</span>
                      <input
                        className={input}
                        value={name}
                        onChange={(e) =>
                          person
                            ? setForm({ id: person.id, name: e.target.value, role })
                            : undefined
                        }
                      />
                    </label>
                    <label className={FIELD_IN_ROW}>
                      <span className={label}>Role</span>
                      <select
                        className={select}
                        value={role}
                        onChange={(e) =>
                          person
                            ? setForm({
                                id: person.id,
                                name,
                                role: e.target.value as UserRole,
                              })
                            : undefined
                        }
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>
                  </div>

                  <p className={cn(hint, "mt-3")}>
                    {person.timezone} · {person.habitCount} habits ·{" "}
                    {person.emailVerified ? "Email verified" : "Email unverified"}
                    {person.bannedReason ? ` · ${person.bannedReason}` : ""}
                  </p>

                  <div className={cn(settingsActions, "mt-[18px]")}>
                    <button
                      type="button"
                      className={cn(btn, btnPrimary)}
                      disabled={busy || !name.trim()}
                      onClick={() => void saveProfile()}
                    >
                      Save
                    </button>
                    {person.status === "active" ? (
                      <button
                        type="button"
                        className={cn(btn, btnDanger)}
                        disabled={busy}
                        onClick={() => setConfirm("ban")}
                      >
                        Ban
                      </button>
                    ) : null}
                    {person.status === "banned" ? (
                      <button
                        type="button"
                        className={btn}
                        disabled={busy}
                        onClick={() => setConfirm("unban")}
                      >
                        Unban
                      </button>
                    ) : null}
                    {person.status !== "trashed" ? (
                      <button
                        type="button"
                        className={cn(btn, btnGhost)}
                        disabled={busy}
                        onClick={() => setConfirm("trash")}
                      >
                        Trash
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={btn}
                          disabled={busy}
                          onClick={() => setConfirm("restore")}
                        >
                          Restore
                        </button>
                        <button
                          type="button"
                          className={cn(btn, btnDanger)}
                          disabled={busy}
                          onClick={() => setConfirm("delete")}
                        >
                          Delete forever
                        </button>
                      </>
                    )}
                  </div>
                </motion.section>

                {person.role === "customer" && person.status === "active" ? (
                  <motion.section
                    className={cn(card, "mt-[18px]")}
                    variants={reduce ? undefined : fadeUpSoft}
                  >
                    <div className={panelHead}>
                      <h2 className={sectionTitle}>Grant Pro access</h2>
                    </div>
                    <div className={cn(fieldRow, "mt-2")}>
                      <label className={FIELD_IN_ROW}>
                        <span className={label}>Plan</span>
                        <select
                          className={select}
                          value={grantForm.planSlug}
                          onChange={(e) =>
                            setGrantForm((current) => ({
                              ...current,
                              planSlug: e.target.value as GrantPlanAccessInput["planSlug"],
                            }))
                          }
                        >
                          <option value="pro-year">Pro — 1 year</option>
                          <option value="pro-lifetime">Pro — Lifetime</option>
                        </select>
                      </label>
                      <label className={FIELD_IN_ROW}>
                        <span className={label}>Access type</span>
                        <select
                          className={select}
                          value={grantForm.accessType}
                          onChange={(e) =>
                            setGrantForm((current) => ({
                              ...current,
                              accessType: e.target.value as GrantPlanAccessInput["accessType"],
                            }))
                          }
                        >
                          <option value="timed">Timed</option>
                          <option value="lifetime">Lifetime</option>
                        </select>
                      </label>
                      {grantForm.accessType === "timed" ? (
                        <label className={FIELD_IN_ROW}>
                          <span className={label}>Days</span>
                          <input
                            className={input}
                            type="number"
                            min={1}
                            max={3650}
                            value={grantForm.days ?? 365}
                            onChange={(e) =>
                              setGrantForm((current) => ({
                                ...current,
                                days: Number(e.target.value),
                              }))
                            }
                          />
                        </label>
                      ) : null}
                    </div>
                    <label className={cn(field, "mt-3")}>
                      <span className={label}>Notes</span>
                      <input
                        className={input}
                        value={grantForm.notes ?? ""}
                        onChange={(e) =>
                          setGrantForm((current) => ({
                            ...current,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Optional internal note"
                      />
                    </label>
                    <div className={cn(settingsActions, "mt-4")}>
                      <button
                        type="button"
                        className={cn(btn, btnPrimary)}
                        disabled={busy}
                        onClick={() => void grantProAccess()}
                      >
                        Grant access
                      </button>
                    </div>
                  </motion.section>
                ) : null}

                <motion.section
                  className={cn(card, "mt-[18px]")}
                  variants={reduce ? undefined : fadeUpSoft}
                >
                  <div className={panelHead}>
                    <h2 className={sectionTitle}>Subscriptions</h2>
                    <Link href="/subscriptions" className={cn(inlineLink, mono)}>
                      All →
                    </Link>
                  </div>
                  {detail.subscriptions.length === 0 ? (
                    <p className={hint}>No subscriptions yet.</p>
                  ) : (
                    <ul className={FEED}>
                      {detail.subscriptions.map((item) => (
                        <li key={item.id} className={FEED_ITEM}>
                          <div className={FEED_COPY}>
                            <div className={PERSON_NAME}>{item.plan.name}</div>
                            <div className={PERSON_META}>
                              {formatCents(item.plan.priceCents, item.plan.currency)} ·{" "}
                              {item.currentPeriodEnd
                                ? `until ${formatPrettyIso(item.currentPeriodEnd)}`
                                : "no end date"}
                            </div>
                          </div>
                          <span className={subscriptionStatusChip(item.status)}>
                            {subscriptionStatusLabel(item.status)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.section>

                <motion.section
                  className={cn(card, "mt-[18px]")}
                  variants={reduce ? undefined : fadeUpSoft}
                >
                  <div className={panelHead}>
                    <h2 className={sectionTitle}>Payments</h2>
                    <Link href="/payments" className={cn(inlineLink, mono)}>
                      All →
                    </Link>
                  </div>
                  {detail.payments.length === 0 ? (
                    <p className={hint}>No payments yet.</p>
                  ) : (
                    <ul className={FEED}>
                      {detail.payments.map((item) => (
                        <li key={item.id} className={FEED_ITEM}>
                          <div className={FEED_COPY}>
                            <div className={PERSON_NAME}>
                              {formatCents(item.amountCents, item.currency)}
                            </div>
                            <div className={PERSON_META}>
                              {item.plan?.name ?? "No plan"} ·{" "}
                              {formatPrettyIso(item.paidAt)}
                            </div>
                          </div>
                          <span className={paymentStatusChip(item.status)}>
                            {paymentStatusLabel(item.status)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.section>
              </>
            )}
          </motion.div>

          <ConfirmSheet
            open={confirm !== null}
            onClose={() => setConfirm(null)}
            title={
              confirm === "ban"
                ? `Ban ${person?.name}?`
                : confirm === "unban"
                  ? `Unban ${person?.name}?`
                  : confirm === "trash"
                    ? `Trash ${person?.name}?`
                    : confirm === "restore"
                      ? `Restore ${person?.name}?`
                      : `Delete ${person?.name}?`
            }
          >
            <p className={cn(hint, "mt-2.5 leading-[1.55]")}>
              {confirm === "ban"
                ? "They lose access immediately. Sessions are revoked."
                : confirm === "delete"
                  ? "This cannot be undone."
                  : confirm === "trash"
                    ? "They leave the live list until you restore them."
                    : "This updates their account status."}
            </p>
            {confirm === "ban" ? (
              <label className={cn(field, "mt-4")}>
                <span className={label}>Reason</span>
                <input
                  className={input}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Optional"
                />
              </label>
            ) : null}
            <div className={cn(settingsActions, "mt-[22px]")}>
              <button
                type="button"
                className={cn(btn, btnGhost)}
                onClick={() => setConfirm(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={cn(
                  btn,
                  confirm === "unban" || confirm === "restore"
                    ? btnPrimary
                    : btnDanger,
                )}
                disabled={busy}
                onClick={() => void runConfirm()}
              >
                Confirm
              </button>
            </div>
          </ConfirmSheet>
        </MotionConfig>
      )}
    </RoleGate>
  );
}

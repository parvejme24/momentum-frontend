"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  AuthFormItem,
  AuthShell,
  authAlert,
  authBrandDesktop,
  authFields,
  authFoot,
  authFootLink,
  authHeading,
} from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import {
  PasswordStrengthMeter,
  scorePassword,
} from "@/components/auth/password-strength";
import { useToast } from "@/components/auth/toast";
import { BrandLink } from "@/components/home/brand-mark";
import { ApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";
import {
  btn,
  btnBlock,
  btnLg,
  btnPrimary,
  field,
  hint,
  hintErr,
  label,
  muted,
} from "@/lib/ui";

export function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const { pushToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const canSubmit = password.length > 0 && confirm.length > 0;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextErrors: Record<string, string> = {};
    if (!token) {
      setFormError("This reset link is missing a token. Request a new one.");
      return;
    }
    if (scorePassword(password) < 2) {
      nextErrors.password = "Password must be at least 8 characters";
    }
    if (password !== confirm) {
      nextErrors.confirm = "Passwords do not match";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    try {
      await resetPassword({ token, password });
      pushToast("Password updated. Sign in with the new one.");
      window.setTimeout(() => {
        router.replace("/login");
      }, 450);
    } catch (err) {
      if (err instanceof ApiError) {
        const fromApi = err.fieldErrors();
        if (Object.keys(fromApi).length > 0) setFieldErrors(fromApi);
        else if (err.code === "RATE_LIMITED") {
          setFormError("Too many attempts. Wait a minute and try again.");
        } else {
          setFormError(err.message || "This reset link is invalid or expired.");
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      art={{
        headline: "Pick the chain back up.",
        body: "Set a new password and the squares you already marked stay put.",
        footer: <p>One new password. Back to the log.</p>,
      }}
    >
      <AuthFormItem className={authBrandDesktop}>
        <BrandLink size="md" />
      </AuthFormItem>

      <AuthFormItem className={authHeading}>
        <h1>Reset password</h1>
        <p className={cn(muted, "mt-2 dark:text-ink-70")}>
          Choose a new password for your account.
        </p>
      </AuthFormItem>

      <AuthFormItem>
        <form className={authFields} onSubmit={onSubmit} noValidate>
          {formError ? (
            <p role="alert" className={authAlert}>
              {formError}
            </p>
          ) : null}

          {!token ? (
            <p className={authAlert} role="alert">
              This page needs a reset token from your email. Request a new link
              if this one is incomplete.
            </p>
          ) : null}

          <div className={field}>
            <label htmlFor="password">
              <span className={label}>New password</span>
            </label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              disabled={pending || !token}
            />
            <PasswordStrengthMeter password={password} />
            {fieldErrors.password ? (
              <span className={cn(hint, hintErr)}>{fieldErrors.password}</span>
            ) : null}
          </div>

          <div className={field}>
            <label htmlFor="confirm">
              <span className={label}>Confirm password</span>
            </label>
            <PasswordInput
              id="confirm"
              name="confirm"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={Boolean(fieldErrors.confirm)}
              disabled={pending || !token}
            />
            {fieldErrors.confirm ? (
              <span className={cn(hint, hintErr)}>{fieldErrors.confirm}</span>
            ) : null}
          </div>

          <button
            type="submit"
            className={cn(btn, btnPrimary, btnBlock, btnLg)}
            disabled={pending || !canSubmit || !token}
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Updating password…
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>
      </AuthFormItem>

      <AuthFormItem>
        <p className={authFoot}>
          Remembered it?{" "}
          <Link href="/login" className={authFootLink}>
            Sign in
          </Link>
          {" · "}
          <Link href="/forgot-password" className={authFootLink}>
            Request a new link
          </Link>
        </p>
      </AuthFormItem>
    </AuthShell>
  );
}

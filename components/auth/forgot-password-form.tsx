"use client";

import { useState } from "react";
import Link from "next/link";
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
  authSuccess,
} from "@/components/auth/auth-shell";
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
  input,
  label,
  muted,
} from "@/lib/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const canSubmit = email.trim().length > 0;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmed = email.trim();
    const nextErrors: Record<string, string> = {};
    if (!EMAIL_RE.test(trimmed)) {
      nextErrors.email = "Enter a valid email address";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    try {
      await forgotPassword(trimmed);
      setSentTo(trimmed);
    } catch (err) {
      if (err instanceof ApiError) {
        const fromApi = err.fieldErrors();
        if (Object.keys(fromApi).length > 0) setFieldErrors(fromApi);
        else if (err.code === "RATE_LIMITED") {
          setFormError("Too many attempts. Wait a minute and try again.");
        } else {
          setFormError(err.message || "Something went wrong. Please try again.");
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
        headline: "The chain can wait a minute.",
        body: "Forgot the password? Reset it and pick the habit back up — the squares you already marked stay put.",
        footer: <p>One inbox. One link. Back to the log.</p>,
      }}
    >
      <AuthFormItem className={authBrandDesktop}>
        <BrandLink size="md" />
      </AuthFormItem>

      {sentTo ? (
        <>
          <AuthFormItem className={authHeading}>
            <h1>Check your inbox</h1>
            <p className={cn(muted, "mt-2 dark:text-ink-70")}>
              If an account exists for <strong>{sentTo}</strong>, we sent a
              reset link. It may take a minute to arrive.
            </p>
          </AuthFormItem>

          <AuthFormItem>
            <div className={authFields}>
              <p className={authSuccess} role="status">
                Didn’t get it? Check spam, or try again with the same address.
              </p>
              <button
                type="button"
                className={cn(btn, btnPrimary, btnBlock, btnLg)}
                onClick={() => {
                  setSentTo(null);
                  setFormError(null);
                  setFieldErrors({});
                }}
              >
                Try another email
              </button>
            </div>
          </AuthFormItem>

          <AuthFormItem>
            <p className={authFoot}>
              Remembered it?{" "}
              <Link href="/login" className={authFootLink}>
                Sign in
              </Link>
            </p>
          </AuthFormItem>
        </>
      ) : (
        <>
          <AuthFormItem className={authHeading}>
            <h1>Forgot password</h1>
            <p className={cn(muted, "mt-2 dark:text-ink-70")}>
              Enter the email on your account and we’ll send a reset link.
            </p>
          </AuthFormItem>

          <AuthFormItem>
            <form className={authFields} onSubmit={onSubmit} noValidate>
              {formError ? (
                <p role="alert" className={authAlert}>
                  {formError}
                </p>
              ) : null}

              <label className={field}>
                <span className={label}>Email</span>
                <input
                  className={input}
                  type="email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.email)}
                  disabled={pending}
                />
                {fieldErrors.email ? (
                  <span className={cn(hint, hintErr)}>{fieldErrors.email}</span>
                ) : null}
              </label>

              <button
                type="submit"
                className={cn(btn, btnPrimary, btnBlock, btnLg)}
                disabled={pending || !canSubmit}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Sending link…
                  </>
                ) : (
                  "Send reset link"
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
            </p>
          </AuthFormItem>
        </>
      )}
    </AuthShell>
  );
}

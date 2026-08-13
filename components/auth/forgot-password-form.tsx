"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { AuthFormItem, AuthShell } from "@/components/auth/auth-shell";
import { BrandLockup } from "@/components/home/brand-mark";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requestPasswordReset(email: string): Promise<void> {
  try {
    await api.post("/auth/forgot-password", { email }, { skipAuthRetry: true });
  } catch (err) {
    // Backend endpoint is not shipped yet — keep the page usable, and avoid
    // revealing whether an account exists once the API lands.
    if (
      err instanceof ApiError &&
      (err.status === 404 || err.code === "NOT_FOUND")
    ) {
      return;
    }
    throw err;
  }
}

export function ForgotPasswordForm() {
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
      await requestPasswordReset(trimmed);
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
      <AuthFormItem className="auth-form-brand-desktop">
        <BrandLockup size="md" />
      </AuthFormItem>

      {sentTo ? (
        <>
          <AuthFormItem className="auth-heading">
            <h1>Check your inbox</h1>
            <p className="muted">
              If an account exists for <strong>{sentTo}</strong>, we sent a
              reset link. It may take a minute to arrive.
            </p>
          </AuthFormItem>

          <AuthFormItem>
            <div className="auth-fields">
              <p className="auth-success" role="status">
                Didn’t get it? Check spam, or try again with the same address.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg"
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
            <p className="auth-foot mono">
              Remembered it?{" "}
              <Link href="/login" className="auth-foot-link">
                Sign in
              </Link>
            </p>
          </AuthFormItem>
        </>
      ) : (
        <>
          <AuthFormItem className="auth-heading">
            <h1>Forgot password</h1>
            <p className="muted">
              Enter the email on your account and we’ll send a reset link.
            </p>
          </AuthFormItem>

          <AuthFormItem>
            <form className="auth-fields" onSubmit={onSubmit} noValidate>
              {formError ? (
                <p role="alert" className="auth-alert">
                  {formError}
                </p>
              ) : null}

              <label className="field">
                <span className="label">Email</span>
                <input
                  className="input"
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
                  <span className="hint hint-err">{fieldErrors.email}</span>
                ) : null}
              </label>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
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
            <p className="auth-foot mono">
              Remembered it?{" "}
              <Link href="/login" className="auth-foot-link">
                Sign in
              </Link>
            </p>
          </AuthFormItem>
        </>
      )}
    </AuthShell>
  );
}

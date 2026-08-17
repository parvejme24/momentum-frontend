"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AuthFormItem, AuthShell } from "@/components/auth/auth-shell";
import { BrandLink } from "@/components/home/brand-mark";
import { ApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/context";

type Status = "missing" | "pending" | "ok" | "error";

export function VerifyEmailForm() {
  const { user, verifyEmail, resendVerification } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [status, setStatus] = useState<Status>(token ? "pending" : "missing");
  const [message, setMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("missing");
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        await verifyEmail(token);
        if (!cancelled) setStatus("ok");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          err instanceof ApiError
            ? err.message || "This verification link is invalid or expired."
            : "Something went wrong. Please try again.",
        );
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [token, verifyEmail]);

  async function onResend() {
    setResending(true);
    setMessage(null);
    try {
      await resendVerification();
      setResent(true);
    } catch (err) {
      setMessage(
        err instanceof ApiError
          ? err.message
          : "Couldn’t send a new verification email.",
      );
    } finally {
      setResending(false);
    }
  }

  const heading =
    status === "ok"
      ? "Email verified"
      : status === "pending"
        ? "Verifying email"
        : "Verify your email";

  const body =
    status === "ok"
      ? "Your address is confirmed. You can keep using the log."
      : status === "pending"
        ? "Hang on while we confirm the link from your inbox."
        : "Use the link we sent, or request a new one if this one expired.";

  return (
    <AuthShell
      art={{
        headline: "One inbox. Then the grid.",
        body: "Confirm the address so password resets and reminders land where they should.",
        footer: <p>The squares wait. This takes a second.</p>,
      }}
    >
      <AuthFormItem className="auth-form-brand-desktop">
        <BrandLink size="md" />
      </AuthFormItem>

      <AuthFormItem className="auth-heading">
        <h1>{heading}</h1>
        <p className="muted">{body}</p>
      </AuthFormItem>

      <AuthFormItem>
        <div className="auth-fields">
          {status === "pending" ? (
            <p className="auth-success" role="status">
              <Loader2 className="animate-spin" size={18} />
              Confirming your email…
            </p>
          ) : null}

          {status === "ok" ? (
            <p className="auth-success" role="status">
              You’re verified. Welcome back to the log.
            </p>
          ) : null}

          {status === "missing" ? (
            <p className="auth-alert" role="alert">
              This page needs a verification token from your email.
            </p>
          ) : null}

          {status === "error" && message ? (
            <p className="auth-alert" role="alert">
              {message}
            </p>
          ) : null}

          {resent ? (
            <p className="auth-success" role="status">
              A new verification email is on its way.
            </p>
          ) : null}

          {status === "ok" ? (
            <Link
              href={user ? "/dashboard" : "/login"}
              className="btn btn-primary btn-block btn-lg"
            >
              {user ? "Continue" : "Sign in"}
            </Link>
          ) : status === "pending" ? null : user ? (
            <button
              type="button"
              className="btn btn-primary btn-block btn-lg"
              onClick={() => void onResend()}
              disabled={resending || resent}
            >
              {resending ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Sending…
                </>
              ) : resent ? (
                "Email sent"
              ) : (
                "Resend verification email"
              )}
            </button>
          ) : (
            <Link href="/login" className="btn btn-primary btn-block btn-lg">
              Sign in to resend
            </Link>
          )}
        </div>
      </AuthFormItem>

      <AuthFormItem>
        <p className="auth-foot mono">
          <Link href="/login" className="auth-foot-link">
            Back to sign in
          </Link>
        </p>
      </AuthFormItem>
    </AuthShell>
  );
}

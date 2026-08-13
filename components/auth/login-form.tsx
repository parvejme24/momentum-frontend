"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AuthFormItem, AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { useToast } from "@/components/auth/toast";
import { BrandLink } from "@/components/home/brand-mark";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

export function LoginForm() {
  const { login } = useAuth();
  const { pushToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const canSubmit = email.trim().length > 0 && password.length > 0;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextErrors: Record<string, string> = {};
    if (!EMAIL_RE.test(email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }
    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    try {
      void keepSignedIn;
      await login(email.trim(), password);
      pushToast("Signed in. Welcome back.");
      window.setTimeout(() => {
        router.replace(safeNextPath(searchParams.get("next")));
      }, 450);
    } catch (err) {
      if (err instanceof ApiError) {
        const fromApi = err.fieldErrors();
        if (Object.keys(fromApi).length > 0) setFieldErrors(fromApi);
        if (err.code === "UNAUTHORIZED") {
          setFormError(err.message || "Invalid email or password");
        } else if (Object.keys(fromApi).length === 0) {
          setFormError(err.message);
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
        headline: "Your chain is still there.",
        body: "Continue the streaks you already started — the days of reading, the morning scroll, the quiet check-ins that add up.",
        footer: (
          <p>Momentum keeps the log. You keep showing up.</p>
        ),
      }}
    >
      <AuthFormItem className="auth-form-brand-desktop">
        <BrandLink size="md" />
      </AuthFormItem>

      <AuthFormItem className="auth-heading">
        <h1>Welcome back</h1>
        <p className="muted">Pick up where the chain left off.</p>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              disabled={pending}
            />
            {fieldErrors.email ? (
              <span className="hint hint-err">{fieldErrors.email}</span>
            ) : null}
          </label>

          <div className="field">
            <div className="label-row">
              <label htmlFor="password" className="label">
                Password
              </label>
              <Link href="/forgot-password" className="auth-inline-link mono">
                Forgot it?
              </Link>
            </div>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              disabled={pending}
            />
            {fieldErrors.password ? (
              <span className="hint hint-err">{fieldErrors.password}</span>
            ) : null}
          </div>

          <div className="auth-switch flex items-center space-x-2">
            <Switch
              id="keep-signed-in"
              checked={keepSignedIn}
              onCheckedChange={setKeepSignedIn}
              disabled={pending}
            />
            <Label htmlFor="keep-signed-in">Keep me signed in on this device</Label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={pending || !canSubmit}
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </AuthFormItem>

      <AuthFormItem>
        <div className="divider mono">or</div>
      </AuthFormItem>

      <AuthFormItem>
        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={() => pushToast("Google sign-in is coming soon.")}
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </AuthFormItem>

      <AuthFormItem>
        <p className="auth-foot mono">
          No account yet?{" "}
          <Link href="/register" className="auth-foot-link">
            Create one
          </Link>
        </p>
      </AuthFormItem>
    </AuthShell>
  );
}

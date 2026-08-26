"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Shield, UserRound } from "lucide-react";

import {
  LOGIN_CELEBRATION_MS,
  LoginCelebration,
} from "@/components/auth/login-celebration";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  AuthFormItem,
  AuthShell,
  authAlert,
  authBrandDesktop,
  authDivider,
  authFields,
  authFoot,
  authFootLink,
  authHeading,
  authInlineLink,
} from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { useToast } from "@/components/auth/toast";
import { BrandLink } from "@/components/home/brand-mark";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/context";
import { DEMO_LOGINS, showDemoLogins } from "@/lib/auth/demo-logins";
import { cn } from "@/lib/utils";
import {
  btn,
  btnBlock,
  btnGhost,
  btnLg,
  btnPrimary,
  field,
  hint,
  hintErr,
  input,
  label,
  mono,
  muted,
} from "@/lib/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

export function LoginForm({ nextPath = null }: { nextPath?: string | null }) {
  const { login } = useAuth();
  const { pushToast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [demoPending, setDemoPending] = useState<"customer" | "admin" | null>(
    null,
  );
  const [celebrating, setCelebrating] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const canSubmit = email.trim().length > 0 && password.length > 0;
  const isBusy = pending || demoPending !== null || celebrating;

  function afterLoginSuccess() {
    setCelebrating(true);
    setRedirectTo(safeNextPath(nextPath));
    pushToast("Signed in. Welcome back.");
  }

  useEffect(() => {
    if (!celebrating || !redirectTo) return;
    const id = window.setTimeout(() => {
      router.replace(redirectTo);
    }, LOGIN_CELEBRATION_MS);
    return () => window.clearTimeout(id);
  }, [celebrating, redirectTo, router]);

  async function completeLogin(nextEmail: string, nextPassword: string) {
    setFormError(null);
    setFieldErrors({});
    await login(nextEmail, nextPassword);
    afterLoginSuccess();
  }

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
      await completeLogin(email.trim(), password);
    } catch (err) {
      if (err instanceof ApiError) {
        const fromApi = err.fieldErrors();
        if (Object.keys(fromApi).length > 0) setFieldErrors(fromApi);
        if (err.code === "UNAUTHORIZED") {
          setFormError(err.message || "Invalid email or password");
        } else if (err.code === "RATE_LIMITED") {
          setFormError("Too many attempts. Wait a minute and try again.");
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

  async function onDemoLogin(role: "customer" | "admin") {
    const demo = DEMO_LOGINS.find((entry) => entry.role === role);
    if (!demo) return;

    setFormError(null);
    setFieldErrors({});
    setEmail(demo.email);
    setPassword(demo.password);
    setDemoPending(role);

    try {
      await completeLogin(demo.email, demo.password);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "UNAUTHORIZED") {
          setFormError(
            "Demo account not found. Run `npm run seed -w @momentum/api` in the backend.",
          );
        } else if (err.code === "RATE_LIMITED") {
          setFormError("Too many attempts. Wait a minute and try again.");
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setDemoPending(null);
    }
  }

  return (
    <>
      <LoginCelebration active={celebrating} />
      <AuthShell
      art={{
        headline: "Your chain is still there.",
        body: "Continue the streaks you already started — the days of reading, the morning scroll, the quiet check-ins that add up.",
        footer: (
          <p>Momentum keeps the log. You keep showing up.</p>
        ),
      }}
    >
      <AuthFormItem className={authBrandDesktop}>
        <BrandLink size="md" />
      </AuthFormItem>

      <AuthFormItem className={authHeading}>
        <h1>Welcome back</h1>
        <p className={cn(muted, "mt-2 dark:text-ink-70")}>
          Pick up where the chain left off.
        </p>
      </AuthFormItem>

      {showDemoLogins() ? (
        <AuthFormItem>
          <div className="grid gap-[var(--space-2)]">
            <p className={cn(mono, "m-0 text-[0.72rem] tracking-[0.12em] text-ink-50 uppercase")}>
              Quick demo access
            </p>
            <div className="grid grid-cols-2 gap-[var(--gap)] max-nav:grid-cols-1">
              {DEMO_LOGINS.map((demo) => {
                const isAdmin = demo.role === "admin";
                const pending = demoPending === demo.role;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    className={cn(
                      btn,
                      btnGhost,
                      btnBlock,
                      "grid min-h-auto justify-items-start gap-1 px-3.5 py-3 text-left text-[0.84rem]",
                      "dark:border-[rgba(221,216,207,0.12)] dark:bg-[color-mix(in_srgb,var(--paper-white)_75%,transparent)] dark:shadow-paper-sm dark:enabled:hover:border-[#8ba4c9]/32 dark:enabled:hover:bg-paper-white",
                      isAdmin &&
                        "bg-[color-mix(in_srgb,var(--blue-soft)_72%,var(--paper-white))] dark:border-[#8ba4c9]/28 dark:bg-[color-mix(in_srgb,var(--blue-soft)_85%,var(--paper-raised))]",
                    )}
                    disabled={isBusy}
                    onClick={() => void onDemoLogin(demo.role)}
                  >
                    <span className="inline-flex items-center gap-2 font-bold">
                      {pending ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : isAdmin ? (
                        <Shield size={18} aria-hidden />
                      ) : (
                        <UserRound size={18} aria-hidden />
                      )}
                      <span>{demo.label}</span>
                    </span>
                    <span className={cn(mono, "text-[0.68rem] leading-[1.35] break-all text-ink-50")}>
                      {demo.email}
                    </span>
                    <span className={cn(mono, "text-[0.68rem] leading-[1.35] break-all text-ink-50")}>
                      {demo.password}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className={cn(mono, "m-0 text-[0.68rem] leading-[1.45] tracking-[0.04em] text-ink-50 [&_code]:text-[0.66rem]")}>
              Run <code>npm run db:seed</code> in momentum-backend if login fails.
            </p>
          </div>
        </AuthFormItem>
      ) : null}

      {showDemoLogins() ? (
        <AuthFormItem>
          <div className={authDivider}>or sign in with email</div>
        </AuthFormItem>
      ) : null}

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              disabled={isBusy}
            />
            {fieldErrors.email ? (
              <span className={cn(hint, hintErr)}>{fieldErrors.email}</span>
            ) : null}
          </label>

          <div className={field}>
            <div className="mb-[7px] flex items-baseline justify-between gap-3">
              <label htmlFor="password" className={cn(label, "mb-0")}>
                Password
              </label>
              <Link href="/forgot-password" className={authInlineLink}>
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
              disabled={isBusy}
            />
            {fieldErrors.password ? (
              <span className={cn(hint, hintErr)}>{fieldErrors.password}</span>
            ) : null}
          </div>

          <div className="mt-0.5 flex items-center space-x-2 [&_[data-slot=label]]:cursor-pointer [&_[data-slot=label]]:text-[0.92rem] [&_[data-slot=label]]:font-semibold">
            <Switch
              id="keep-signed-in"
              checked={keepSignedIn}
              onCheckedChange={setKeepSignedIn}
              disabled={isBusy}
            />
            <Label htmlFor="keep-signed-in">Keep me signed in on this device</Label>
          </div>

          <button
            type="submit"
            className={cn(btn, btnPrimary, btnBlock, btnLg)}
            disabled={isBusy || !canSubmit}
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
        <div className={authDivider}>or</div>
      </AuthFormItem>

      <AuthFormItem>
        <GoogleSignInButton
          disabled={isBusy}
          onSuccess={() => {
            afterLoginSuccess();
          }}
          onError={setFormError}
        />
      </AuthFormItem>

      <AuthFormItem>
        <p className={authFoot}>
          No account yet?{" "}
          <Link href="/register" className={authFootLink}>
            Create one
          </Link>
        </p>
      </AuthFormItem>
    </AuthShell>
    </>
  );
}

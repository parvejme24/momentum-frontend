"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  AuthFormItem,
  AuthShell,
  authAlert,
  authBrandDesktop,
  authChecklist,
  authDivider,
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
  input,
  label,
  mono,
  muted,
  select,
} from "@/lib/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function useTimezoneOptions() {
  return useMemo(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const supported =
      typeof Intl.supportedValuesOf === "function"
        ? Intl.supportedValuesOf("timeZone")
        : [
            "UTC",
            "America/New_York",
            "America/Chicago",
            "America/Denver",
            "America/Los_Angeles",
            "Europe/London",
            "Europe/Paris",
            "Asia/Dhaka",
            "Asia/Kolkata",
            "Asia/Tokyo",
            "Australia/Sydney",
          ];

    const preferred = [
      detected,
      "UTC",
      "America/New_York",
      "America/Los_Angeles",
      "Europe/London",
      "Asia/Dhaka",
      "Asia/Tokyo",
    ];

    const set = new Set<string>([...preferred, ...supported.slice(0, 80)]);
    return { detected, options: Array.from(set) };
  }, []);
}

export function RegisterForm() {
  const { register } = useAuth();
  const { pushToast } = useToast();
  const router = useRouter();
  const { detected, options } = useTimezoneOptions();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [timezone, setTimezone] = useState(detected);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const canSubmit =
    name.trim().length > 0 && email.trim().length > 0 && password.length > 0;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const nextErrors: Record<string, string> = {};
    if (trimmedName.length < 1 || trimmedName.length > 60) {
      nextErrors.name = "Name must be between 1 and 60 characters";
    }
    if (!EMAIL_RE.test(email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }
    if (scorePassword(password) < 2) {
      nextErrors.password = "Password must be at least 8 characters";
    }
    if (!timezone) {
      nextErrors.timezone = "Choose a timezone";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    try {
      await register({
        name: trimmedName,
        email: email.trim(),
        password,
        timezone,
      });
      pushToast("Account created. Let’s mark the first square.");
      window.setTimeout(() => {
        router.replace("/habits/new");
      }, 450);
    } catch (err) {
      if (err instanceof ApiError) {
        const fromApi = err.fieldErrors();
        const emailTaken =
          err.code === "CONFLICT" ||
          err.status === 409 ||
          /already (exist|in use|registered)|email.*exist/i.test(
            err.message,
          ) ||
          /already (exist|in use|registered)/i.test(fromApi.email ?? "");

        if (emailTaken) {
          setFieldErrors({
            ...fromApi,
            email: fromApi.email || "This email already exists",
          });
          pushToast("This email already exists");
        } else if (Object.keys(fromApi).length > 0) {
          setFieldErrors(fromApi);
        } else if (err.code === "RATE_LIMITED") {
          setFormError("Too many attempts. Wait a minute and try again.");
        } else {
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
        headline: "One square. Then another.",
        body: "Nothing to configure or buy. Add a habit, mark today, and let the grid do the rest.",
        footer: (
          <ul className={authChecklist}>
            <li>Free, and no card at signup</li>
            <li>Laptop and phone on one account</li>
            <li>Export everything, any time</li>
          </ul>
        ),
      }}
    >
      <AuthFormItem className={authBrandDesktop}>
        <BrandLink size="md" />
      </AuthFormItem>

      <AuthFormItem className={authHeading}>
        <h1>Create your account</h1>
        <p className={cn(muted, "mt-2 dark:text-ink-70")}>
          Takes about a minute, including your first habit.
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
            <span className={label}>Name</span>
            <input
              className={input}
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              disabled={pending}
            />
            {fieldErrors.name ? (
              <span className={cn(hint, hintErr)}>{fieldErrors.name}</span>
            ) : null}
          </label>

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
              disabled={pending}
            />
            {fieldErrors.email ? (
              <span className={cn(hint, hintErr)}>{fieldErrors.email}</span>
            ) : null}
          </label>

          <div className={field}>
            <label htmlFor="password">
              <span className={label}>Password</span>
            </label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              disabled={pending}
            />
            <PasswordStrengthMeter password={password} />
            {fieldErrors.password ? (
              <span className={cn(hint, hintErr)}>{fieldErrors.password}</span>
            ) : null}
          </div>

          <label className={field}>
            <span className={label}>Timezone</span>
            <select
              className={select}
              name="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              aria-invalid={Boolean(fieldErrors.timezone)}
              disabled={pending}
            >
              {options.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            <span className={hint}>
              Day rollover uses this zone, so late-night ticks still count for
              today.
            </span>
            {fieldErrors.timezone ? (
              <span className={cn(hint, hintErr)}>{fieldErrors.timezone}</span>
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
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </button>

          <p className={cn(mono, "m-0 text-[0.68rem] leading-[1.45] tracking-[0.04em] text-ink-50")}>
            By creating an account you agree to keep the log honest — and to our
            terms when they land.
          </p>
        </form>
      </AuthFormItem>

      <AuthFormItem>
        <div className={authDivider}>or</div>
      </AuthFormItem>

      <AuthFormItem>
        <GoogleSignInButton
          disabled={pending}
          onSuccess={() => {
            pushToast("Account created with Google.");
            window.setTimeout(() => {
              router.replace("/habits/new");
            }, 450);
          }}
          onError={setFormError}
        />
      </AuthFormItem>

      <AuthFormItem>
        <p className={authFoot}>
          Already tracking?{" "}
          <Link href="/login" className={authFootLink}>
            Sign in
          </Link>
        </p>
      </AuthFormItem>
    </AuthShell>
  );
}

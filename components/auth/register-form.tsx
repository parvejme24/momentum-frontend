"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AuthFormItem, AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import {
  PasswordStrengthMeter,
  scorePassword,
} from "@/components/auth/password-strength";
import { useToast } from "@/components/auth/toast";
import { BrandLink } from "@/components/home/brand-mark";
import { ApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
        router.replace("/onboarding/habit");
      }, 450);
    } catch (err) {
      if (err instanceof ApiError) {
        const fromApi = err.fieldErrors();
        if (Object.keys(fromApi).length > 0) setFieldErrors(fromApi);
        if (Object.keys(fromApi).length === 0) {
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
          <ul className="auth-checklist">
            <li>Free, and no card at signup</li>
            <li>Laptop and phone on one account</li>
            <li>Export everything, any time</li>
          </ul>
        ),
      }}
    >
      <AuthFormItem className="auth-form-brand-desktop">
        <BrandLink size="md" />
      </AuthFormItem>

      <AuthFormItem className="auth-heading">
        <h1>Create your account</h1>
        <p className="muted">
          Takes about a minute, including your first habit.
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
            <span className="label">Name</span>
            <input
              className="input"
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              disabled={pending}
            />
            {fieldErrors.name ? (
              <span className="hint hint-err">{fieldErrors.name}</span>
            ) : null}
          </label>

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
            <label htmlFor="password">
              <span className="label">Password</span>
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
              <span className="hint hint-err">{fieldErrors.password}</span>
            ) : null}
          </div>

          <label className="field">
            <span className="label">Timezone</span>
            <select
              className="select"
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
            <span className="hint">
              Day rollover uses this zone, so late-night ticks still count for
              today.
            </span>
            {fieldErrors.timezone ? (
              <span className="hint hint-err">{fieldErrors.timezone}</span>
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
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </button>

          <p className="auth-legal mono">
            By creating an account you agree to keep the log honest — and to our
            terms when they land.
          </p>
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
          Already tracking?{" "}
          <Link href="/login" className="auth-foot-link">
            Sign in
          </Link>
        </p>
      </AuthFormItem>
    </AuthShell>
  );
}

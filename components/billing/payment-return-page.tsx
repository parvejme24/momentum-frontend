"use client";

import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

import {
  formatPaymentElapsed,
  useCheckoutReturn,
} from "@/lib/billing/use-checkout-return";
import { BrandLink } from "@/components/home/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

function PaymentReturnBody() {
  const { phase, elapsedSeconds, message, provider, loginNext } =
    useCheckoutReturn();

  const isSsl = provider === "sslcommerz";
  const waiting =
    phase === "initializing" ||
    phase === "processing" ||
    phase === "success";
  const showSslCopy = isSsl && waiting;

  if (phase === "idle") {
    return (
      <div className="payment-return-shell">
        <div className="payment-return-theme">
          <ThemeToggle />
        </div>
        <div className="payment-return-card rise-auth">
          <BrandLink size="sm" className="payment-return-brand" />
          <h1 className="payment-return-title">No payment to process</h1>
          <p className="payment-return-lede">
            This page opens automatically after SSLCommerz or Stripe checkout.
          </p>
          <div className="payment-return-actions">
            <Link href="/dashboard" className="btn btn-primary btn-block">
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-return-shell">
      <div className="payment-return-theme">
        <ThemeToggle />
      </div>

      <div className="payment-return-card rise-auth">
        <BrandLink size="sm" className="payment-return-brand" />

        {phase === "success" ? (
          <div className="payment-return-icon payment-return-icon-success">
            <CheckCircle2 size={40} strokeWidth={2.2} aria-hidden />
          </div>
        ) : phase === "failed" || phase === "error" ? (
          <div className="payment-return-icon payment-return-icon-error">
            <XCircle size={40} strokeWidth={2.2} aria-hidden />
          </div>
        ) : phase === "cancelled" ? (
          <div className="payment-return-icon payment-return-icon-muted">
            <XCircle size={40} strokeWidth={2.2} aria-hidden />
          </div>
        ) : (
          <div className="payment-return-spinner" aria-hidden>
            <LoaderCircle size={42} strokeWidth={2.4} />
          </div>
        )}

        {showSslCopy ? (
          <>
            <h1 className="payment-return-title">
              {phase === "success"
                ? "Payment successful"
                : "Please wait. Your order is processing…"}
            </h1>
            {phase !== "success" ? (
              <p className="payment-return-lede">
                To complete the process, please click the{" "}
                <strong>Continue</strong> button if prompted. If you press{" "}
                <strong>Cancel</strong>, the process will not be completed.
              </p>
            ) : (
              <p className="payment-return-lede payment-return-lede-success">
                {message ?? "Your plan is now active."}
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className="payment-return-title">
              {phase === "success"
                ? "Payment successful"
                : phase === "failed"
                  ? "Payment failed"
                  : phase === "cancelled"
                    ? "Payment cancelled"
                    : phase === "auth_required"
                      ? "Sign in to finish"
                      : phase === "error"
                        ? "Something went wrong"
                        : "Processing your payment…"}
            </h1>
            <p className="payment-return-lede">
              {message ??
                (phase === "initializing"
                  ? "Restoring your session and confirming payment…"
                  : "This usually takes a few seconds. Please keep this tab open.")}
            </p>
          </>
        )}

        {waiting ? (
          <div className="payment-return-timer" role="timer" aria-live="polite">
            <span className="payment-return-timer-label">Elapsed</span>
            <span className="payment-return-timer-value mono">
              {formatPaymentElapsed(elapsedSeconds)}
            </span>
          </div>
        ) : null}

        {phase === "success" ? (
          <p className="hint payment-return-redirect">
            Redirecting to your dashboard…
          </p>
        ) : null}

        {phase === "auth_required" ? (
          <div className="payment-return-actions">
            <Link
              href={`/login?next=${encodeURIComponent(loginNext)}`}
              className="btn btn-primary btn-block"
            >
              Sign in to continue
            </Link>
          </div>
        ) : null}

        {phase === "cancelled" || phase === "failed" || phase === "error" ? (
          <div className="payment-return-actions">
            <Link href="/subscription" className="btn btn-primary btn-block">
              Back to subscription
            </Link>
            <Link href="/pricing" className="btn btn-ghost btn-block">
              View plans
            </Link>
          </div>
        ) : null}

        {showSslCopy ? (
          <p className="payment-return-thanks">Thanks for using SSLCommerz.</p>
        ) : null}

        {!isSsl && provider === "stripe" && waiting ? (
          <p className="payment-return-thanks">Secured by Stripe.</p>
        ) : null}
      </div>
    </div>
  );
}

export function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="payment-return-shell" aria-busy="true">
          <div className="payment-return-card rise-auth">
            <div className="payment-return-spinner" aria-hidden>
              <LoaderCircle size={42} strokeWidth={2.4} />
            </div>
            <h1 className="payment-return-title">
              Please wait. Your order is processing…
            </h1>
          </div>
        </div>
      }
    >
      <PaymentReturnBody />
    </Suspense>
  );
}

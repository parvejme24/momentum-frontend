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
import {
  btn,
  btnBlock,
  btnGhost,
  btnPrimary,
  hint,
  mono,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

const SHELL =
  "grid min-h-dvh place-items-center bg-paper bg-[linear-gradient(var(--grid)_1px,transparent_1px),linear-gradient(90deg,var(--grid)_1px,transparent_1px)] bg-size-[24px_24px] px-[18px] pt-7 pb-10";

const CARD =
  "w-[min(100%,520px)] rounded-lg border-[3px] border-ink bg-paper-raised px-[26px] py-7 pb-6 text-center shadow-lift";

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
      <div className={SHELL}>
        <div className="fixed top-4 right-4 z-[2]">
          <ThemeToggle />
        </div>
        <div className={CARD}>
          <BrandLink size="sm" className="mb-[22px] flex justify-center" />
          <h1 className="m-0 font-heading text-[clamp(1.35rem,3vw,1.75rem)] leading-[1.15] tracking-[-0.03em]">
            No payment to process
          </h1>
          <p className="mt-3.5 mb-0 text-[0.95rem] leading-[1.6] text-ink-70">
            This page opens automatically after SSLCommerz or Stripe checkout.
          </p>
          <div className="mt-[22px] grid gap-2.5">
            <Link href="/dashboard" className={cn(btn, btnPrimary, btnBlock)}>
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={SHELL}>
      <div className="fixed top-4 right-4 z-[2]">
        <ThemeToggle />
      </div>

      <div className={CARD}>
        <BrandLink size="sm" className="mb-[22px] flex justify-center" />

        {phase === "success" ? (
          <div className="my-1 mb-[18px] inline-flex text-blue">
            <CheckCircle2 size={40} strokeWidth={2.2} aria-hidden />
          </div>
        ) : phase === "failed" || phase === "error" ? (
          <div className="my-1 mb-[18px] inline-flex text-flame">
            <XCircle size={40} strokeWidth={2.2} aria-hidden />
          </div>
        ) : phase === "cancelled" ? (
          <div className="my-1 mb-[18px] inline-flex text-ink-50">
            <XCircle size={40} strokeWidth={2.2} aria-hidden />
          </div>
        ) : (
          <div
            className="my-1 mb-[18px] inline-flex animate-payment-spin text-blue"
            aria-hidden
          >
            <LoaderCircle size={42} strokeWidth={2.4} />
          </div>
        )}

        {showSslCopy ? (
          <>
            <h1 className="m-0 font-heading text-[clamp(1.35rem,3vw,1.75rem)] leading-[1.15] tracking-[-0.03em]">
              {phase === "success"
                ? "Payment successful"
                : "Please wait. Your order is processing…"}
            </h1>
            {phase !== "success" ? (
              <p className="mt-3.5 mb-0 text-[0.95rem] leading-[1.6] text-ink-70">
                To complete the process, please click the{" "}
                <strong>Continue</strong> button if prompted. If you press{" "}
                <strong>Cancel</strong>, the process will not be completed.
              </p>
            ) : (
              <p className="mt-3.5 mb-0 text-[0.95rem] font-semibold leading-[1.6] text-ink">
                {message ?? "Your plan is now active."}
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className="m-0 font-heading text-[clamp(1.35rem,3vw,1.75rem)] leading-[1.15] tracking-[-0.03em]">
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
            <p className="mt-3.5 mb-0 text-[0.95rem] leading-[1.6] text-ink-70">
              {message ??
                (phase === "initializing"
                  ? "Restoring your session and confirming payment…"
                  : "This usually takes a few seconds. Please keep this tab open.")}
            </p>
          </>
        )}

        {waiting ? (
          <div
            className="mx-auto mt-[22px] inline-grid gap-1 border border-ink/12 bg-paper px-[18px] py-3 shadow-paper-sm"
            role="timer"
            aria-live="polite"
          >
            <span className="text-[0.68rem] tracking-[0.12em] uppercase text-ink-50">
              Elapsed
            </span>
            <span className={cn(mono, "text-[1.35rem] font-bold tracking-[0.08em]")}>
              {formatPaymentElapsed(elapsedSeconds)}
            </span>
          </div>
        ) : null}

        {phase === "success" ? (
          <p className={cn(hint, "mt-4")}>Redirecting to your dashboard…</p>
        ) : null}

        {phase === "auth_required" ? (
          <div className="mt-[22px] grid gap-2.5">
            <Link
              href={`/login?next=${encodeURIComponent(loginNext)}`}
              className={cn(btn, btnPrimary, btnBlock)}
            >
              Sign in to continue
            </Link>
          </div>
        ) : null}

        {phase === "cancelled" || phase === "failed" || phase === "error" ? (
          <div className="mt-[22px] grid gap-2.5">
            <Link href="/subscription" className={cn(btn, btnPrimary, btnBlock)}>
              Back to subscription
            </Link>
            <Link href="/pricing" className={cn(btn, btnGhost, btnBlock)}>
              View plans
            </Link>
          </div>
        ) : null}

        {showSslCopy ? (
          <p className="mt-6 mb-0 border-t border-ink/8 pt-[18px] text-[0.82rem] tracking-[0.02em] text-ink-50">
            Thanks for using SSLCommerz.
          </p>
        ) : null}

        {!isSsl && provider === "stripe" && waiting ? (
          <p className="mt-6 mb-0 border-t border-ink/8 pt-[18px] text-[0.82rem] tracking-[0.02em] text-ink-50">
            Secured by Stripe.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className={SHELL} aria-busy="true">
          <div className={CARD}>
            <div
              className="my-1 mb-[18px] inline-flex animate-payment-spin text-blue"
              aria-hidden
            >
              <LoaderCircle size={42} strokeWidth={2.4} />
            </div>
            <h1 className="m-0 font-heading text-[clamp(1.35rem,3vw,1.75rem)] leading-[1.15] tracking-[-0.03em]">
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

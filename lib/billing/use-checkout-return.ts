"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { getMySubscription } from "@/lib/api/billing";
import { mutationErrorMessage } from "@/lib/admin/map";
import { useAuth } from "@/lib/auth/context";
import { useConfirmCheckout } from "@/lib/billing/hooks";
import { POST_CHECKOUT_PATH } from "@/lib/billing/checkout";
import { billingKeys } from "@/lib/billing/keys";

const PAID_STATUSES = new Set(["active", "trialing", "past_due"]);
const SUCCESS_REDIRECT_MS = 2500;

export type PaymentReturnPhase =
  | "idle"
  | "initializing"
  | "processing"
  | "success"
  | "cancelled"
  | "failed"
  | "auth_required"
  | "error";

export type PaymentReturnState = {
  phase: PaymentReturnPhase;
  elapsedSeconds: number;
  message: string | null;
  provider: "stripe" | "sslcommerz" | null;
  confirming: boolean;
};

async function refetchBilling(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.refetchQueries({ queryKey: billingKeys.subscription() }),
    queryClient.refetchQueries({ queryKey: billingKeys.entitlements() }),
    queryClient.refetchQueries({ queryKey: billingKeys.invoices() }),
  ]);
}

async function hasPaidSubscription() {
  const sub = await getMySubscription();
  return Boolean(
    sub &&
      sub.plan.priceCents > 0 &&
      PAID_STATUSES.has(sub.status),
  );
}

function notifyBillingUpdated() {
  if (typeof window === "undefined") return;
  if (window.opener && !window.opener.closed) {
    window.opener.postMessage(
      { type: "momentum:billing-updated" },
      window.location.origin,
    );
  }
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export { formatElapsed as formatPaymentElapsed };

export function useCheckoutReturn() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const confirm = useConfirmCheckout();
  const handled = useRef<string | null>(null);

  const [phase, setPhase] = useState<PaymentReturnPhase>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [provider, setProvider] = useState<"stripe" | "sslcommerz" | null>(
    null,
  );

  const activePhase =
    phase === "initializing" || phase === "processing" || phase === "success";

  useEffect(() => {
    if (!activePhase) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activePhase]);

  useEffect(() => {
    const checkoutState = searchParams.get("checkout");
    const sslState = searchParams.get("sslcommerz");
    const sessionId = searchParams.get("session_id");
    const tranId = searchParams.get("tran_id");
    const valId = searchParams.get("val_id");

    const hasStripeReturn =
      checkoutState === "success" && Boolean(sessionId);
    const hasSslReturn = sslState === "success" && Boolean(tranId);
    const hasReturn =
      hasStripeReturn ||
      hasSslReturn ||
      checkoutState === "cancel" ||
      sslState === "cancel" ||
      sslState === "fail";

    if (!hasReturn) return;

    if (checkoutState === "cancel") {
      if (handled.current === "stripe-cancel") return;
      handled.current = "stripe-cancel";
      setProvider("stripe");
      setPhase("cancelled");
      setMessage("Checkout was cancelled before payment completed.");
      return;
    }

    if (sslState === "fail") {
      if (handled.current === "ssl-fail") return;
      handled.current = "ssl-fail";
      setProvider("sslcommerz");
      setPhase("failed");
      setMessage("SSLCommerz could not complete this payment.");
      return;
    }

    if (sslState === "cancel") {
      if (handled.current === "ssl-cancel") return;
      handled.current = "ssl-cancel";
      setProvider("sslcommerz");
      setPhase("cancelled");
      setMessage("Payment was cancelled before it could finish.");
      return;
    }

    if (authLoading) {
      setPhase("initializing");
      return;
    }

    if (!user) {
      setProvider(hasSslReturn ? "sslcommerz" : "stripe");
      setPhase("auth_required");
      setMessage(
        "Sign in with the same account you used at checkout to activate your plan.",
      );
      return;
    }

    if (hasStripeReturn && sessionId) {
      const key = `stripe:${sessionId}`;
      if (handled.current === key) return;
      handled.current = key;
      setProvider("stripe");
      setPhase("processing");
      setMessage(null);

      void confirm
        .mutateAsync({ provider: "stripe", sessionId })
        .then(async () => {
          await refetchBilling(queryClient);
          notifyBillingUpdated();
          setPhase("success");
          setMessage("Payment successful. Your plan is active.");
          window.setTimeout(() => {
            router.replace(POST_CHECKOUT_PATH);
          }, SUCCESS_REDIRECT_MS);
        })
        .catch((error) => {
          setPhase("error");
          setMessage(
            mutationErrorMessage(error, "Could not confirm checkout"),
          );
        });
      return;
    }

    if (!hasSslReturn || !tranId) return;

    const key = `ssl:${tranId}:${valId ?? ""}`;
    if (handled.current === key) return;
    handled.current = key;
    setProvider("sslcommerz");
    setPhase("processing");
    setMessage(null);

    void (async () => {
      try {
        if (valId) {
          await confirm.mutateAsync({
            provider: "sslcommerz",
            tranId,
            valId,
          });
        }

        await refetchBilling(queryClient);
        if (await hasPaidSubscription()) {
          notifyBillingUpdated();
          setPhase("success");
          setMessage("Payment successful. Your plan is active.");
          window.setTimeout(() => {
            router.replace(POST_CHECKOUT_PATH);
          }, SUCCESS_REDIRECT_MS);
          return;
        }

        for (let attempt = 0; attempt < 15; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await refetchBilling(queryClient);
          if (await hasPaidSubscription()) {
            notifyBillingUpdated();
            setPhase("success");
            setMessage("Payment successful. Your plan is active.");
            window.setTimeout(() => {
              router.replace(POST_CHECKOUT_PATH);
            }, SUCCESS_REDIRECT_MS);
            return;
          }
        }

        notifyBillingUpdated();
        setPhase("success");
        setMessage(
          "Payment received. Your plan should finish activating shortly.",
        );
        window.setTimeout(() => {
          router.replace(POST_CHECKOUT_PATH);
        }, SUCCESS_REDIRECT_MS);
      } catch (error) {
        await refetchBilling(queryClient);
        if (await hasPaidSubscription()) {
          notifyBillingUpdated();
          setPhase("success");
          setMessage("Payment successful. Your plan is active.");
          window.setTimeout(() => {
            router.replace(POST_CHECKOUT_PATH);
          }, SUCCESS_REDIRECT_MS);
          return;
        }
        setPhase("error");
        setMessage(mutationErrorMessage(error, "Could not confirm checkout"));
      }
    })();
  }, [
    authLoading,
    confirm,
    pathname,
    queryClient,
    router,
    searchParams,
    user,
  ]);

  const loginNext = `${pathname}?${searchParams.toString()}`;

  return {
    phase,
    elapsedSeconds,
    message,
    provider,
    confirming: confirm.isPending,
    loginNext,
  } satisfies PaymentReturnState & { loginNext: string };
}

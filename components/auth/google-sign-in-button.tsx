"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { useToast } from "@/components/auth/toast";
import { ApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/context";
import { getGoogleClientId } from "@/lib/auth/google";
import { cn } from "@/lib/utils";
import { btnBlock } from "@/lib/ui";

type GoogleCredentialResponse = {
  credential: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              type?: "standard" | "icon";
            },
          ) => void;
        };
      };
    };
  }
}

type GoogleSignInButtonProps = {
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

function isGoogleScriptReady(): boolean {
  return typeof window !== "undefined" && Boolean(window.google?.accounts?.id);
}

function GoogleMark() {
  return (
    <svg
      className="block shrink-0"
      viewBox="0 0 24 24"
      width={20}
      height={20}
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function GoogleSignInButton({
  disabled = false,
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const clientId = getGoogleClientId();
  const { loginWithGoogle } = useAuth();
  const { pushToast } = useToast();
  const initializedRef = useRef(false);
  const hiddenTargetRef = useRef<HTMLDivElement>(null);
  const gsiReadyRef = useRef(false);
  const [scriptReady, setScriptReady] = useState(isGoogleScriptReady);
  const [pending, setPending] = useState(false);

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        const message = "Google did not return a sign-in token.";
        onError?.(message);
        pushToast(message);
        return;
      }

      setPending(true);
      try {
        await loginWithGoogle(response.credential);
        onSuccess?.();
      } catch (err) {
        let message = "Could not sign in with Google.";
        if (err instanceof ApiError) {
          if (err.code === "ACCOUNT_BANNED") {
            message = "This account has been banned.";
          } else if (err.code === "RATE_LIMITED") {
            message = "Too many attempts. Wait a minute and try again.";
          } else if (err.code === "SERVICE_UNAVAILABLE") {
            message = "Google sign-in is not configured on the server.";
          } else if (err.message) {
            message = err.message;
          }
        }
        onError?.(message);
        pushToast(message);
      } finally {
        setPending(false);
      }
    },
    [loginWithGoogle, onError, onSuccess, pushToast],
  );

  const mountHiddenButton = useCallback(() => {
    const node = hiddenTargetRef.current;
    if (!node || !clientId || disabled || !isGoogleScriptReady()) {
      return false;
    }

    const google = window.google;
    if (!google?.accounts?.id) return false;

    if (!initializedRef.current) {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      initializedRef.current = true;
    }

    if (node.dataset.googleRendered !== "true") {
      node.innerHTML = "";
      google.accounts.id.renderButton(node, {
        theme: "outline",
        size: "large",
        type: "standard",
      });
      node.dataset.googleRendered = "true";
    }

    gsiReadyRef.current = true;
    return Boolean(node.querySelector('div[role="button"]'));
  }, [clientId, disabled, handleCredential]);

  useEffect(() => {
    if (!clientId || disabled) return;

    if (mountHiddenButton()) return;

    let attempts = 0;
    const id = window.setInterval(() => {
      attempts += 1;
      if (mountHiddenButton() || attempts >= 50) {
        window.clearInterval(id);
      }
    }, 100);

    return () => window.clearInterval(id);
  }, [clientId, disabled, mountHiddenButton, scriptReady]);

  const markScriptReady = useCallback(() => {
    gsiReadyRef.current = isGoogleScriptReady();
    setScriptReady(true);
  }, []);

  const triggerGoogleSignIn = useCallback(() => {
    if (!clientId) {
      pushToast("Google sign-in is not configured yet.");
      return;
    }

    if (!mountHiddenButton()) {
      pushToast("Google sign-in is still loading. Try again in a moment.");
      return;
    }

    const googleButton = hiddenTargetRef.current?.querySelector(
      'div[role="button"]',
    ) as HTMLElement | null;

    if (!googleButton) {
      pushToast("Google sign-in is still loading. Try again in a moment.");
      return;
    }

    googleButton.click();
  }, [clientId, mountHiddenButton, pushToast]);

  return (
    <>
      {clientId ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={markScriptReady}
          onReady={markScriptReady}
        />
      ) : null}

      <div ref={hiddenTargetRef} className="sr-only" aria-hidden />

      <button
        type="button"
        className={cn(
          btnBlock,
          "flex min-h-12 cursor-pointer items-center justify-center rounded-md border border-[var(--stroke)] bg-paper-white px-[22px] py-3 font-sans text-[0.94rem] leading-[1.2] font-semibold text-ink shadow-paper-sm transition-[transform,box-shadow,background,border-color] duration-fast ease-smooth enabled:hover:-translate-y-0.5 enabled:hover:bg-paper-raised enabled:hover:shadow-hover enabled:active:translate-y-0 enabled:active:shadow-press disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-paper-sm",
          "dark:border-[rgba(221,216,207,0.12)] dark:bg-paper-raised dark:shadow-paper-sm dark:enabled:hover:border-[#8ba4c9]/35 dark:enabled:hover:bg-paper-white dark:enabled:hover:-translate-y-0.5 dark:enabled:hover:shadow-paper dark:enabled:active:translate-y-0 dark:enabled:active:shadow-paper-sm",
        )}
        disabled={disabled || pending}
        aria-busy={pending}
        onClick={triggerGoogleSignIn}
      >
        <span className="inline-flex items-center justify-center gap-2.5">
          {pending ? (
            <Loader2 className="shrink-0 animate-spin text-ink-70" size={18} />
          ) : (
            <GoogleMark />
          )}
          <span>{pending ? "Signing in…" : "Continue with Google"}</span>
        </span>
      </button>
    </>
  );
}

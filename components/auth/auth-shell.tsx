"use client";

import { MotionConfig } from "framer-motion";

import { AuthArtPanel } from "@/components/auth/auth-art";
import { BrandLink } from "@/components/home/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthShell({
  children,
  art,
}: {
  children: React.ReactNode;
  art: {
    headline: string;
    body: string;
    footer: React.ReactNode;
  };
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="auth">
        <div className="auth-theme">
          <ThemeToggle />
        </div>
        <AuthArtPanel
          headline={art.headline}
          body={art.body}
          footer={art.footer}
        />

        <div className="auth-form">
          <div className="auth-form-top">
            <BrandLink size="sm" className="auth-form-brand-mobile" />
          </div>

          <div className="auth-box rise-auth">{children}</div>
        </div>
      </div>
    </MotionConfig>
  );
}

export function AuthFormItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

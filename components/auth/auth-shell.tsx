"use client";

import { motion, useReducedMotion, MotionConfig } from "framer-motion";

import { AuthArtPanel } from "@/components/auth/auth-art";
import { BrandLink } from "@/components/home/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { easeOut, fadeUp, staggerContainer } from "@/components/home/motion";

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
  const reduce = useReducedMotion();

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

          <motion.div
            className="auth-box rise-auth"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={reduce ? undefined : staggerContainer}
          >
            {children}
          </motion.div>
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
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : fadeUp}
      transition={{ duration: 0.45, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

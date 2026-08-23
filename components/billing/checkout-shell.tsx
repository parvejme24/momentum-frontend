"use client";

import { MotionConfig } from "framer-motion";

import { BrandLink } from "@/components/home/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export function CheckoutShell({
  children,
  art,
}: {
  children: React.ReactNode;
  art: {
    eyebrow: string;
    title: string;
    body: string;
    price: string;
    period: string;
    footer?: React.ReactNode;
  };
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="checkout-desk">
        <div className="checkout-desk-theme">
          <ThemeToggle />
        </div>

        <aside className="checkout-art" aria-label="Order summary">
          <BrandLink size="sm" className="checkout-art-brand" />
          <div>
            <p className="checkout-art-eyebrow">{art.eyebrow}</p>
            <h1 className="checkout-art-title">{art.title}</h1>
            <p className="checkout-art-body">{art.body}</p>
            <p className="checkout-art-price mono">
              {art.price}
              <span className="checkout-art-period">{art.period}</span>
            </p>
          </div>
          {art.footer ? <div className="checkout-art-foot">{art.footer}</div> : null}
        </aside>

        <main className="checkout-main">
          <div className="checkout-main-inner rise-auth">{children}</div>
        </main>
      </div>
    </MotionConfig>
  );
}

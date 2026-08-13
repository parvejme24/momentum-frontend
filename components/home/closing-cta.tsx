"use client";

import { motion, useReducedMotion } from "framer-motion";

import { BrandLockup } from "@/components/home/brand-mark";
import { InkButton } from "@/components/home/ink-button";
import { MotionItem, MotionSection, easeOut } from "@/components/home/motion";

export function ClosingCta() {
  const reduce = useReducedMotion();

  return (
    <MotionSection className="section">
      <div className="wrap">
        <MotionItem
          className="cta-band"
          hoverLift
          style={{ boxShadow: "var(--shadow-lift)" }}
        >
          <motion.p
            className="eyebrow flame"
            animate={
              reduce
                ? undefined
                : { opacity: [0.7, 1, 0.7] }
            }
            transition={
              reduce
                ? undefined
                : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
            }
          >
            Begin
          </motion.p>
          <h2 style={{ marginTop: 16 }}>
            The first square is the hard one.
          </h2>
          <p className="lede" style={{ marginTop: 16 }}>
            After that, it’s just another day in the chain. Start a free logbook,
            or look around the demo first.
          </p>
          <motion.div
            className="row"
            style={{ justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: easeOut, delay: 0.15 }}
          >
            <InkButton href="/register" variant="flame" size="lg">
              Create your account
            </InkButton>
            <InkButton href="#demo" variant="ghost" size="lg">
              Look around first
            </InkButton>
          </motion.div>
        </MotionItem>
      </div>
    </MotionSection>
  );
}

export function SiteFooter() {
  const reduce = useReducedMotion();

  return (
    <motion.footer
      className="footer"
      initial={reduce ? false : { opacity: 0 }}
      whileInView={reduce ? undefined : { opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="wrap row-between">
        <BrandLockup size="sm" />
        <nav
          className="row mono muted"
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
          aria-label="Footer"
        >
          {(
            [
              ["#demo", "Dashboard"],
              ["#features", "Habits"],
              ["#rules", "Stats"],
              ["#how", "Settings"],
            ] as const
          ).map(([href, label]) => (
            <motion.a
              key={href}
              href={href}
              className="cursor-pointer"
              whileHover={reduce ? undefined : { color: "var(--blue)", y: -1 }}
              transition={{ duration: 0.15 }}
            >
              {label}
            </motion.a>
          ))}
        </nav>
      </div>
      <p
        className="wrap mono muted"
        style={{
          marginTop: 24,
          fontSize: "0.65rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        © {new Date().getFullYear()} Momentum — show up, mark the square.
      </p>
    </motion.footer>
  );
}

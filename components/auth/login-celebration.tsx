"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";

import { easeOut } from "@/components/home/motion";

const CONFETTI_COLORS = [
  "#2b4ce0",
  "#ff5a36",
  "#7a3fb8",
  "#5471e9",
  "#34a853",
  "#fbbc05",
  "#141a2e",
  "#dde3fb",
];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  width: number;
  height: number;
  color: string;
  drift: number;
};

function createParticles(width: number, count: number): Particle[] {
  const originX = width * 0.5;

  return Array.from({ length: count }, () => {
    const spread = (Math.random() - 0.5) * 1.4;
    const speed = Math.random() * 9 + 5;

    return {
      x: originX + (Math.random() - 0.5) * 28,
      y: 56 + (Math.random() - 0.5) * 16,
      vx: spread * speed,
      vy: Math.random() * 3 + 4,
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 14,
      width: Math.random() * 9 + 5,
      height: Math.random() * 5 + 3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]!,
      drift: (Math.random() - 0.5) * 0.25,
    };
  });
}

function runConfetti(canvas: HTMLCanvasElement, durationMs: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let raf = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resize();
  const particles = createParticles(window.innerWidth, 140);
  window.addEventListener("resize", resize);

  const started = performance.now();

  const tick = (now: number) => {
    const elapsed = now - started;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    for (const particle of particles) {
      particle.vy += 0.18;
      particle.vx += particle.drift;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.spin;

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.fillStyle = particle.color;
      ctx.fillRect(
        -particle.width / 2,
        -particle.height / 2,
        particle.width,
        particle.height,
      );
      ctx.restore();
    }

    if (elapsed < durationMs) {
      raf = window.requestAnimationFrame(tick);
    }
  };

  raf = window.requestAnimationFrame(tick);

  return () => {
    window.cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}

type LoginCelebrationProps = {
  active: boolean;
  title?: string;
  subtitle?: string;
};

export function LoginCelebration({
  active,
  title = "Welcome back!",
  subtitle = "Your chain is waiting.",
}: LoginCelebrationProps) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    return runConfetti(canvas, 1600);
  }, [active, reduce]);

  if (!active || typeof document === "undefined") return null;

  return createPortal(
    <div className="login-celebration" aria-live="polite" aria-atomic="true">
      {!reduce ? (
        <canvas ref={canvasRef} className="login-celebration-canvas" aria-hidden />
      ) : null}
      <div className="login-celebration-anchor">
        <motion.div
          className="login-celebration-card"
          initial={reduce ? false : { opacity: 0, y: -36, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.48, ease: easeOut }}
        >
          <p className="login-celebration-eyebrow mono">Signed in</p>
          <h2 className="login-celebration-title">{title}</h2>
          <p className="login-celebration-sub">{subtitle}</p>
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}

export const LOGIN_CELEBRATION_MS = 1500;

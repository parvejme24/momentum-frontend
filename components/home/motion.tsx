"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";

export const easeOut = [0.16, 1, 0.3, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

export const fadeUpSoft: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.06,
    },
  },
};

export function MotionSection({
  children,
  className,
  id,
  style,
  ...rest
}: HTMLMotionProps<"section">) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={className}
      style={{ scrollMarginTop: 90, ...style }}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.16, margin: "0px 0px -6% 0px" }}
      variants={reduce ? undefined : staggerContainer}
      {...rest}
    >
      {children}
    </motion.section>
  );
}

type MotionItemProps = HTMLMotionProps<"div"> & {
  as?: "div" | "article";
  hoverLift?: boolean;
};

export function MotionItem({
  children,
  className,
  as = "div",
  hoverLift = false,
  ...rest
}: MotionItemProps) {
  const reduce = useReducedMotion();
  const Comp = as === "article" ? motion.article : motion.div;

  return (
    <Comp
      className={className}
      variants={reduce ? undefined : fadeUpSoft}
      whileHover={
        reduce || !hoverLift
          ? undefined
          : {
              x: -3,
              y: -3,
              boxShadow: "7px 7px 0 var(--ink)",
              transition: { duration: 0.18, ease: easeOut },
            }
      }
      whileTap={
        reduce || !hoverLift
          ? undefined
          : { x: 1, y: 1, boxShadow: "2px 2px 0 var(--ink)" }
      }
      {...rest}
    >
      {children}
    </Comp>
  );
}

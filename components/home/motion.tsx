"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";

/** Smooth deceleration — used for page enters and hovers. */
export const easeSmooth = [0.22, 1, 0.36, 1] as const;
export const easeOut = easeSmooth;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: easeSmooth },
  },
};

export const fadeUpSoft: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: easeSmooth },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

/** Smooth page enter for app shell content. */
export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeSmooth },
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
              y: -4,
              x: -2,
              transition: { duration: 0.38, ease: easeSmooth },
            }
      }
      whileTap={
        reduce || !hoverLift
          ? undefined
          : {
              y: -1,
              x: 0,
              transition: { duration: 0.18, ease: easeSmooth },
            }
      }
      {...rest}
    >
      {children}
    </Comp>
  );
}

"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

type Direction = "up" | "left" | "right" | "none" | "scale";

function offsetFor(direction: Direction) {
  switch (direction) {
    case "up":
      return { y: 22 };
    case "left":
      return { x: -28 };
    case "right":
      return { x: 28 };
    case "scale":
      return { scale: 1.04 };
    default:
      return {};
  }
}

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
  amount = 0.18,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  once?: boolean;
  amount?: number;
  as?: "div" | "section" | "article" | "li";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[Tag];

  if (reduce) {
    const Static = Tag;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, ...offsetFor(direction) }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount, margin: "0px 0px -48px 0px" }}
      transition={{ duration: 0.52, delay, ease }}
    >
      {children}
    </MotionTag>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.04 },
  },
};

const staggerItem = (direction: Direction): Variants => ({
  hidden: { opacity: 0, ...offsetFor(direction) },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { duration: 0.48, ease },
  },
});

export function Stagger({
  children,
  className,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -40px 0px" }}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={staggerItem(direction)}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

export function HeroMotion({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offsetFor(direction) }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function HeroImageMotion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 1.06 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease }}
    >
      {children}
    </motion.div>
  );
}

export function FloatDecor({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={`pointer-events-none absolute ${className ?? ""}`} aria-hidden />;
  }
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute ${className ?? ""}`}
      animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

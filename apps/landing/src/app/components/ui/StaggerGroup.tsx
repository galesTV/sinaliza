"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
};

export function StaggerGroup({
  children,
  className,
  staggerDelay = 0.12,
}: StaggerGroupProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.15,
      }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  duration?: number;
};

export function StaggerItem({
  children,
  className,
  duration = 0.5,
}: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      className={className}
      variants={{
        hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: shouldReduceMotion ? 0 : duration,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {children}
    </motion.article>
  );
}

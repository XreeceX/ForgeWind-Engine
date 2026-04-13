"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

interface ParallaxLayerProps {
  depth?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ParallaxLayer({ depth = 0.2, className, children }: ParallaxLayerProps) {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -180 * depth]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1 + depth * 0.08]);

  return (
    <motion.div
      className={className}
      style={shouldReduceMotion ? undefined : { y, scale }}
      transition={{ type: "spring", stiffness: 90, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}

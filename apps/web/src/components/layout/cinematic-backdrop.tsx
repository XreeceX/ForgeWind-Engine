"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { AimlMotionField } from "@/components/layout/aiml-motion-field";

export function CinematicBackdrop() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const orbPrimaryY = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const orbSecondaryY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const orbSecondaryScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -140]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-40 left-[6%] h-[30rem] w-[30rem] rounded-full bg-primary-400/22 blur-[120px]"
        style={shouldReduceMotion ? undefined : { y: orbPrimaryY }}
      />
      <motion.div
        className="absolute top-[22%] right-[-8%] h-[26rem] w-[26rem] rounded-full bg-accent-300/20 blur-[110px]"
        style={shouldReduceMotion ? undefined : { y: orbSecondaryY, scale: orbSecondaryScale }}
      />
      <motion.div
        className="absolute bottom-[-6%] left-[20%] h-[22rem] w-[22rem] rounded-full bg-white/80 blur-[100px]"
        style={shouldReduceMotion ? undefined : { y: orbSecondaryY }}
      />
      <motion.div
        className="cinematic-grid absolute inset-x-[-18%] top-[8%] h-[76vh] opacity-35"
        style={shouldReduceMotion ? undefined : { y: gridY }}
      />
      <AimlMotionField variant="shell" className="opacity-70" />
      <div className="cinematic-vignette absolute inset-0" />
      <div className="cinematic-grain absolute inset-0 opacity-[0.06]" />
    </div>
  );
}

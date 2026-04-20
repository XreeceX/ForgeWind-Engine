"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { AimlMotionField } from "@/components/layout/aiml-motion-field";
import { ParallaxLayer } from "@/components/cinematic/ParallaxLayer";

export function DepthBackground() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const zoom = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 6]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-[-12%] bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.22),transparent_46%),radial-gradient(circle_at_78%_18%,rgba(253,186,116,0.12),transparent_42%),radial-gradient(circle_at_48%_80%,rgba(234,88,12,0.14),transparent_48%)]"
        style={shouldReduceMotion ? undefined : { scale: zoom, rotate }}
      />
      <ParallaxLayer depth={0.5} className="absolute -left-16 top-[8%] h-80 w-80 rounded-full bg-primary-500/22 blur-[110px]" />
      <ParallaxLayer depth={0.35} className="absolute right-[-10%] top-[28%] h-72 w-72 rounded-full bg-accent-400/14 blur-[105px]" />
      <ParallaxLayer depth={0.2} className="absolute bottom-[-8%] left-[25%] h-96 w-96 rounded-full bg-white/8 blur-[120px]" />
      <div className="cinematic-grid absolute inset-x-[-12%] top-[5%] h-[78vh] opacity-35" />
      <AimlMotionField variant="cinematic" className="opacity-80" />
      <div className="cinematic-vignette absolute inset-0" />
      <div className="cinematic-grain absolute inset-0 opacity-[0.07]" />
    </div>
  );
}

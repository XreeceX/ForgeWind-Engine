"use client";

import { motion } from "framer-motion";

interface AnimatedTextRevealProps {
  text: string;
  className?: string;
}

export function AnimatedTextReveal({ text, className }: AnimatedTextRevealProps) {
  const words = text.split(" ");

  return (
    <p className={className}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mr-1.5 inline-block"
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

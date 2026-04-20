"use client";

import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function useCountUpOnView(
  target: number,
  options: { duration?: number; decimals?: number; start?: number } = {},
) {
  const { duration = 900, decimals = 0, start = 0 } = options;
  const [value, setValue] = useState(start);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setValue(target);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started.current) return;
        started.current = true;
        const t0 = performance.now();

        function tick(now: number) {
          const t = Math.min(1, (now - t0) / duration);
          const eased = easeOutCubic(t);
          const v = start + (target - start) * eased;
          setValue(decimals > 0 ? Number(v.toFixed(decimals)) : Math.round(v));
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.2, rootMargin: "0px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, decimals, start]);

  return { ref, value };
}

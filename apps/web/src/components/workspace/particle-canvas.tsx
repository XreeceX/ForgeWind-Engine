"use client";

import { useCallback, useEffect, useRef } from "react";

const ORANGE = "#F97316";
const N = 60;
const LINK_DIST = 120;
const PARALLAX = 8;

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  o: number;
}

export function ParticleCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);
  const reduceRef = useRef(false);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  const initDots = useCallback((w: number, h: number) => {
    dotsRef.current = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 2 + Math.random() * 3,
      o: 0.15 + Math.random() * 0.25,
    }));
  }, []);

  useEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resize();
    const parent = canvas.parentElement;
    const w = parent?.clientWidth ?? 800;
    const h = parent?.clientHeight ?? 200;
    initDots(w, h);

    const onResize = () => {
      resize();
      const pw = parent?.clientWidth ?? w;
      const ph = parent?.clientHeight ?? h;
      initDots(pw, ph);
    };
    window.addEventListener("resize", onResize);

    const onMove = (e: MouseEvent) => {
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    parent?.addEventListener("mousemove", onMove);

    function frame() {
      if (!canvas || !ctx || !parent) return;
      const cw = parent.clientWidth;
      const ch = parent.clientHeight;
      ctx.clearRect(0, 0, cw, ch);

      if (reduceRef.current) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      const mx = (mouseRef.current.x - 0.5) * PARALLAX * 2;
      const my = (mouseRef.current.y - 0.5) * PARALLAX * 2;
      const dots = dotsRef.current;

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > cw) d.vx *= -1;
        if (d.y < 0 || d.y > ch) d.vy *= -1;
        d.x = Math.max(0, Math.min(cw, d.x));
        d.y = Math.max(0, Math.min(ch, d.y));
      }

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i];
          const b = dots[j];
          if (a == null || b == null) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.12;
            ctx.strokeStyle = `rgba(249,115,22,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x + mx * 0.15, a.y + my * 0.15);
            ctx.lineTo(b.x + mx * 0.15, b.y + my * 0.15);
            ctx.stroke();
          }
        }
      }

      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x + mx * 0.2, d.y + my * 0.2, d.r, 0, Math.PI * 2);
        ctx.fillStyle = ORANGE;
        ctx.globalAlpha = d.o;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", onResize);
      parent?.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [initDots, resize]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}

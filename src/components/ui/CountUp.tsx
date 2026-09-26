"use client";

import { useEffect, useRef } from "react";

export function CountUp({ to, from = 0, duration = 1400 }: { to: number; from?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (now: number) => {
          const k = Math.min(1, (now - t0) / duration);
          el.textContent = String(Math.round(from + (to - from) * (1 - (1 - k) ** 4)));
          if (k < 1) raf = requestAnimationFrame(step);
        };
        el.textContent = String(from);
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, from, duration]);

  return <span ref={ref}>{to}</span>;
}

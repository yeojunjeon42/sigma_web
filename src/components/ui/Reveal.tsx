"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({
  children,
  stagger = 60,
  y = 12,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  stagger?: number;
  y?: number;
  as?: "div" | "ul" | "ol";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.dataset.reveal = "out";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "in";
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLUListElement & HTMLOListElement>}
      style={{ "--reveal-y": `${y}px`, "--reveal-step": `${stagger}ms` } as React.CSSProperties}
      className={className}
    >
      {children}
    </Tag>
  );
}

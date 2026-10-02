"use client";

import { useLayoutEffect } from "react";

// Reveal rules once on entry; mark visible rows before paint to avoid replaying their reveal.
export default function RuleIn() {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const rows = [...document.querySelectorAll<HTMLElement>(".u-rule-in")];
    for (const row of rows) {
      const r = row.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) row.dataset.in = "";
    }
    root.dataset.rules = "";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.in = "";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const row of rows) if (row.dataset.in === undefined) io.observe(row);
    return () => {
      io.disconnect();
      delete root.dataset.rules;
    };
  }, []);
  return null;
}

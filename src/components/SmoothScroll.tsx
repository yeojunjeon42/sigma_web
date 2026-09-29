"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const scrollable = (node: HTMLElement) => {
  for (let el: HTMLElement | null = node; el && el !== document.body; el = el.parentElement) {
    const s = getComputedStyle(el);
    if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight) return true;
    if (/(auto|scroll)/.test(s.overflowX) && el.scrollWidth > el.clientWidth) return true;
  }
  return false;
};

export default function SmoothScroll() {
  const path = usePathname();

  useEffect(() => {
    const fit = window.matchMedia("(min-width: 64rem) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let raf = 0;
    let last = -1;
    let clock = 0;

    const loop = (t: number) => {
      clock += last < 0 ? 1000 / 60 : Math.min(Math.max(t - last, 0), 50);
      last = t;
      lenis?.raf(clock);
      raf = lenis?.isScrolling === "smooth" ? requestAnimationFrame(loop) : 0;
    };
    const wake = () => {
      if (!lenis || raf) return;
      last = -1;
      raf = requestAnimationFrame(loop);
    };

    const sync = () => {
      const want = fit.matches && !still.matches && !path.startsWith("/archive") && !/^\/blog\/./.test(path);
      if (want && !lenis) {
        lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, autoRaf: false, prevent: scrollable });
      } else if (!want && lenis) {
        cancelAnimationFrame(raf);
        raf = 0;
        lenis.destroy();
        lenis = null;
      }
    };
    const jump = (e: MouseEvent) => {
      if (!lenis || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.<HTMLAnchorElement>('a[href^="#"]');
      const id = a?.getAttribute("href")?.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      e.preventDefault();
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      lenis.scrollTo(el.getBoundingClientRect().top + window.scrollY - margin);
      wake();
      history.replaceState(null, "", `#${id}`);
    };
    sync();
    window.addEventListener("wheel", wake, { passive: true });
    document.addEventListener("click", jump);
    fit.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => {
      window.removeEventListener("wheel", wake);
      cancelAnimationFrame(raf);
      document.removeEventListener("click", jump);
      fit.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
      lenis?.destroy();
    };
  }, [path]);

  return null;
}

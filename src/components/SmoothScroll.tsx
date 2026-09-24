"use client";

// Wheel scrolling eased the way the reference studios ease it (Lenis, lerp 0.1 — measured on
// ref.digital, studio-size.com and locomotive.ca). Desk and fine pointers only; touch stays native.
// Off on /archive, whose field, reel and dial drive the scroll themselves, and on articles,
// which read on the browser's own scroll.

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

    const sync = () => {
      const want = fit.matches && !still.matches && !path.startsWith("/archive") && !/^\/blog\/./.test(path);
      if (want && !lenis) {
        lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, autoRaf: true, prevent: scrollable });
      } else if (!want && lenis) {
        lenis.destroy();
        lenis = null;
      }
    };
    // In-page links glide with the same ease and still honour the target's scroll-margin.
    const jump = (e: MouseEvent) => {
      if (!lenis || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.<HTMLAnchorElement>('a[href^="#"]');
      const id = a?.getAttribute("href")?.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      e.preventDefault();
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      lenis.scrollTo(el.getBoundingClientRect().top + window.scrollY - margin);
      history.replaceState(null, "", `#${id}`);
    };
    sync();
    document.addEventListener("click", jump);
    fit.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => {
      document.removeEventListener("click", jump);
      fit.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
      lenis?.destroy();
    };
  }, [path]);

  return null;
}

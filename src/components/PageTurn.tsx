"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STUCK = 4000;

export default function PageTurn() {
  const pathname = usePathname();

  useEffect(() => {
    let timer = 0;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const a = (e.target as HTMLElement | null)?.closest?.<HTMLAnchorElement>("a[href]");
      if (!a || a.target || a.hasAttribute("download") || a.matches("[data-vt], [data-plate-link]")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (/^\/(ai|studio|llms)/.test(url.pathname) || /^\/(ai|studio)/.test(location.pathname)) return;

      const root = document.documentElement;
      root.dataset.turn = "out";
      window.clearTimeout(timer);
      timer = window.setTimeout(() => delete root.dataset.turn, STUCK);
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.turn) return;
    const frame = requestAnimationFrame(() => delete root.dataset.turn);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}

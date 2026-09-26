"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const RISE = 380;
const CLEAR = 260;
const STUCK = 4000;
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

export default function PageTurn() {
  const router = useRouter();
  const pathname = usePathname();
  const sheet = useRef<HTMLDivElement>(null);
  const up = useRef(false);
  const clearRef = useRef<() => void>(() => {});

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const a = (e.target as HTMLElement | null)?.closest?.<HTMLAnchorElement>("a[href]");
      if (!a || a.target || a.hasAttribute("download") || a.matches("[data-vt], [data-plate-link]")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (/^\/(ai|studio|llms)/.test(url.pathname) || /^\/(ai|studio)/.test(location.pathname)) return;
      const el = sheet.current;
      if (!el || up.current) return;

      e.preventDefault();
      up.current = true;
      el.style.visibility = "visible";
      el.getAnimations().forEach((x) => x.cancel());
      el.animate([{ transform: "translateY(100%)" }, { transform: "none" }], { duration: RISE, easing: EASE, fill: "forwards" })
        .finished.then(() => router.push(url.pathname + url.search + url.hash))
        .catch(() => {});
      window.setTimeout(() => {
        if (up.current) clear();
      }, STUCK);
    };

    const clear = () => {
      const el = sheet.current;
      if (!el) return;
      up.current = false;
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLEAR, easing: "ease-out", fill: "forwards" })
        .finished.then(() => {
          if (up.current) return;
          el.getAnimations().forEach((x) => x.cancel());
          el.style.visibility = "hidden";
        })
        .catch(() => {});
    };

    document.addEventListener("click", onClick, { capture: true });
    clearRef.current = clear;
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [router]);

  useEffect(() => {
    if (up.current) requestAnimationFrame(() => clearRef.current());
  }, [pathname]);

  return (
    <div
      ref={sheet}
      aria-hidden="true"
      className="pointer-events-none invisible fixed inset-0 z-[35] border-t border-rule bg-canvas"
    />
  );
}

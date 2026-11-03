"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { onPageScroll, pageScroller, pageY, scrollPage } from "@/lib/pageScroll";

const STUCK = 4000;

export default function PageTurn() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const mobileScroll = useRef({
    href: "",
    positions: new Map<string, number>(),
    pending: null as number | null,
    leaving: false,
  });

  useLayoutEffect(() => {
    const state = mobileScroll.current;
    const entering = state.href !== "" && state.href.split("?")[0] !== pathname && !location.hash;
    const top = state.pending ?? (entering ? 0 : null);
    state.href = location.pathname + location.search;
    state.pending = null;
    state.leaving = false;
    if (top === null || pageScroller() !== document.body) return;
    scrollPage({ top, behavior: "instant" });
    const frame = requestAnimationFrame(() => scrollPage({ top, behavior: "instant" }));
    return () => cancelAnimationFrame(frame);
  }, [pathname, search]);

  useEffect(() => {
    const state = mobileScroll.current;
    const save = () => {
      if (!state.leaving && pageScroller() === document.body) {
        state.href = location.pathname + location.search;
        state.positions.set(state.href, pageY());
      }
    };
    const leaving = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      save();
      state.leaving = true;
    };
    const back = () => {
      if (pageScroller() !== document.body) return;
      // popstate already points at the destination; retain the departing page's key.
      state.positions.set(state.href, pageY());
      const href = location.pathname + location.search;
      if (href === state.href) return;
      const samePage = new URL(state.href, location.origin).pathname === location.pathname;
      state.pending = state.positions.get(href) ?? (samePage ? null : 0);
      state.leaving = true;
    };
    const stop = onPageScroll(save);
    document.addEventListener("click", leaving, true);
    window.addEventListener("popstate", back, true);
    return () => {
      stop();
      document.removeEventListener("click", leaving, true);
      window.removeEventListener("popstate", back, true);
    };
  }, []);

  useEffect(() => {
    let timer = 0;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!matchMedia("(min-width: 64rem) and (pointer: fine)").matches) return;
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

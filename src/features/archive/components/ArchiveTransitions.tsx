"use client";

// Every move within /archive — a sort, an era, a view, a plate into the reel, Escape out of it —
// runs as one view transition. Names are handed out per move and only to what is on screen:
// between reel and field just the one build is shared, so its plate morphs and nothing doubles.

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const STYLE = `
@media (prefers-reduced-motion: no-preference) {
  ::view-transition-group(*) { animation-duration: 440ms; animation-timing-function: cubic-bezier(0.2, 0.7, 0.1, 1); }
  ::view-transition-old(root) { animation: 160ms ease-out both vt-out; }
  ::view-transition-new(root) { animation: 300ms cubic-bezier(0.2, 0.7, 0.1, 1) 60ms both vt-in; }
  ::view-transition-image-pair(vt-hero) { isolation: auto; }
  ::view-transition-old(vt-hero), ::view-transition-new(vt-hero) { animation-duration: 440ms; mix-blend-mode: normal; height: 100%; object-fit: cover; }
}
@keyframes vt-out { to { opacity: 0; } }
@keyframes vt-in { from { opacity: 0; } }
`;

type Doc = Document & {
  startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void>; skipTransition?: () => void };
};

const SLOW = 650;

const SHARED = "[data-vt-id], [data-reel] [data-plate-id]";
const idOf = (el: HTMLElement) => el.dataset.vtId ?? el.dataset.plateId ?? "";
const view = (s: string) => new URLSearchParams(s).get("view") ?? "depth";
const atOf = (s: string) => new URLSearchParams(s).get("at");

function onScreen(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return r.width > 4 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
}

function clear() {
  document.querySelectorAll<HTMLElement>(SHARED).forEach((el) => (el.style.viewTransitionName = ""));
}

/** `all`: every visible item keeps its identity (sorts, eras). `id`: only that build is shared. */
function name(mode: "all" | string | null) {
  clear();
  if (!mode) return;
  document.querySelectorAll<HTMLElement>(SHARED).forEach((el) => {
    if (!onScreen(el)) return;
    const id = idOf(el);
    if (mode === "all") el.style.viewTransitionName = `vt-${id}`;
    else if (id === mode) el.style.viewTransitionName = "vt-hero";
  });
}

let run: ((href: string) => boolean) | null = null;

/** Moves within the archive through the shared transition; false when it cannot (the caller navigates). */
export function archiveGo(href: string) {
  return run ? run(href) : false;
}

export default function ArchiveTransitions() {
  const router = useRouter();

  useEffect(() => {
    const doc = document as Doc;
    const able = () => !!doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const go = (href: string) => {
      if (!able()) return false;
      const url = new URL(href, window.location.href);
      if (url.pathname !== "/archive" || url.search === window.location.search) return false;
      const from = window.location.search;
      const [a, b] = [view(from), view(url.search)];
      const hero = a === b ? "all" : b === "reel" ? atOf(url.search) : a === "reel" ? atOf(from) : null;
      name(hero);
      const vt = doc.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              router.push(url.pathname + url.search, { scroll: false });
              // Rendering is paused inside the transition, so the new page is polled for, not
              // waited on by frame: the address first, then the build's plate on the new side.
              const t0 = performance.now();
              let movedAt = 0;
              const poll = window.setInterval(() => {
                const now = performance.now();
                const moved = window.location.search === url.search;
                if (moved && !movedAt) movedAt = now;
                // The plate gets a short grace to mount; past it the page crossfades without one.
                const late = now - t0 > 2500 || (movedAt > 0 && now - movedAt > 250);
                if (!moved && !late) return;
                if (hero && hero !== "all" && !late) {
                  const sel =
                    b === "reel"
                      ? `[data-reel] [data-plate-id="${CSS.escape(hero)}"]`
                      : `[data-vt-id="${CSS.escape(hero)}"]`;
                  const el = document.querySelector<HTMLElement>(sel);
                  if (!el || !el.offsetParent) return;
                  if (b !== "reel") {
                    const r = el.getBoundingClientRect();
                    window.scrollTo({ top: window.scrollY + r.top - (window.innerHeight - r.height) / 2, behavior: "instant" });
                  }
                } else if (a !== b) window.scrollTo({ top: 0, behavior: "instant" });
                window.clearInterval(poll);
                name(late && hero !== "all" ? null : hero);
                resolve();
              }, 8);
            }),
        );
      vt.finished.finally(clear);
      // The page is frozen while the transition waits. A slow server is not worth that: past
      // SLOW the change simply lands without the animation.
      window.setTimeout(() => {
        if (window.location.search !== url.search) vt.skipTransition?.();
      }, SLOW);
      return true;
    };
    run = go;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.<HTMLAnchorElement>("a[data-vt], a[data-plate-link]");
      if (!a || !go(a.href)) return;
      e.preventDefault();
      e.stopPropagation();
    };

    // The page is dynamic, so nothing is prefetched by default: fetch a control's target as soon
    // as it is pointed at, and a plate's the moment it is pressed, so the swap waits on nothing.
    // A plate is fetched only after the pointer rests on it, not on every pass over the field.
    const fetched = new Set<string>();
    let dwell = 0;
    const fetchOf = (a: HTMLAnchorElement) => {
      if (fetched.has(a.href)) return;
      fetched.add(a.href);
      const url = new URL(a.href);
      router.prefetch(url.pathname + url.search, { kind: "full" as never });
    };
    const warm = (e: Event) => {
      const a = (e.target as HTMLElement).closest?.<HTMLAnchorElement>("a[data-vt], a[data-plate-link]");
      window.clearTimeout(dwell);
      if (!a) return;
      if (e.type === "pointerover" && !a.matches("[data-vt]")) dwell = window.setTimeout(() => fetchOf(a), 140);
      else fetchOf(a);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerover", warm, { passive: true });
    document.addEventListener("pointerdown", warm, { passive: true });
    document.addEventListener("focusin", warm);
    return () => {
      run = null;
      window.clearTimeout(dwell);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerover", warm);
      document.removeEventListener("pointerdown", warm);
      document.removeEventListener("focusin", warm);
    };
  }, [router]);

  return <style>{STYLE}</style>;
}

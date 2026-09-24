"use client";

import { useEffect } from "react";

const FLY = 460;
/** The build is held for this share of the flight, then let go. */
const HOLD = 0.76;
/** Where the plate heads while the reel is still coming up: the middle of the screen. */
const GUESS = 0.34;

/**
 * The plate you press on the field flies to the place the reel gives it. A copy of the
 * photograph is lifted onto a layer of its own before the page changes, so it outlives the
 * field being taken down, and it chases the reel's own plate — which is still settling while
 * the flight is on — until it lands there and lets go.
 */
export default function PlateHandoff() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Where the browser has view transitions, ArchiveTransitions morphs the plate instead.
    if ((document as { startViewTransition?: unknown }).startViewTransition) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement | null)?.closest?.<HTMLAnchorElement>("a[data-plate-link]");
      const art = link?.firstElementChild;
      if (!link || !(art instanceof HTMLElement)) return;
      const id = new URL(link.href, window.location.href).searchParams.get("at");
      if (id) fly(art, id);
    };

    // Capture: Next's own click handler calls `preventDefault` before a bubbling listener
    // would see it, and a prevented click is not one to follow.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

type Box = { left: number; top: number; width: number };

function fly(art: HTMLElement, id: string) {
  const from = art.getBoundingClientRect();
  if (from.width < 8 || from.height < 8) return;
  const ratio = from.height / from.width;

  const layer = document.createElement("div");
  layer.style.cssText = "position:fixed;inset:0;z-index:60;pointer-events:none";
  const clone = art.cloneNode(true) as HTMLElement;
  const start = Number(getComputedStyle(art).opacity) || 1;
  clone.style.cssText = `position:absolute;left:0;top:0;width:${from.width}px;height:${from.height}px;transform-origin:0 0;will-change:transform,opacity;transform:translate(${from.left}px,${from.top}px);opacity:${start}`;
  layer.append(clone);
  document.body.append(layer);

  const middle = (): Box => {
    const width = Math.min(from.width * 2.4, window.innerWidth * GUESS);
    return {
      left: (window.innerWidth - width) / 2,
      top: (window.innerHeight - width * ratio) / 2,
      width,
    };
  };

  const t0 = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / FLY);
    const e = 1 - (1 - t) ** 3;
    const seat = document.querySelector<HTMLElement>(`[data-reel] [data-plate-id="${CSS.escape(id)}"]`);
    const r = seat?.getBoundingClientRect();
    const to: Box = r && r.width > 8 ? r : middle();
    const x = from.left + (to.left - from.left) * e;
    const y = from.top + (to.top - from.top) * e;
    const scale = 1 + (to.width / from.width - 1) * e;
    clone.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
    clone.style.opacity = String(
      t < HOLD ? Math.min(1, start + (1 - start) * (t / 0.3)) : 1 - (t - HOLD) / (1 - HOLD),
    );
    if (t < 1) requestAnimationFrame(step);
    else layer.remove();
  };

  requestAnimationFrame(step);
}

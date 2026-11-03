"use client";

import { pageY, pageScroller, scrollPage, onPageScroll } from "@/lib/pageScroll";

import { useEffect, useRef } from "react";

export function ScrollRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const thumb = thumbRef.current;
    if (!rail || !thumb || !window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let thumbHeight = 0;
    let travel = 0;
    let scrollRoom = 0;
    let drag: { id: number; y: number; scroll: number } | null = null;

    const paint = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const page = pageScroller().scrollHeight;
      scrollRoom = Math.max(0, page - viewport);
      thumbHeight = scrollRoom ? Math.max(32, (viewport * viewport) / page) : viewport;
      travel = Math.max(0, viewport - thumbHeight);
      const top = scrollRoom ? (pageY() / scrollRoom) * travel : 0;
      rail.dataset.on = scrollRoom > 1 ? "1" : "";
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translate3d(0,${top}px,0)`;
      rail.setAttribute("aria-valuemax", String(Math.round(scrollRoom)));
      rail.setAttribute("aria-valuenow", String(Math.round(pageY())));
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      if (e.target !== thumb) {
        const y = Math.max(0, Math.min(travel, e.clientY - thumbHeight / 2));
        scrollPage({ top: travel ? (y / travel) * scrollRoom : 0, behavior: "instant" });
      }
      drag = { id: e.pointerId, y: e.clientY, scroll: pageY() };
      rail.dataset.dragging = "1";
      rail.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      e.preventDefault();
      const scale = travel ? scrollRoom / travel : 0;
      scrollPage({ top: drag.scroll + (e.clientY - drag.y) * scale, behavior: "instant" });
    };
    const up = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      drag = null;
      delete rail.dataset.dragging;
      if (rail.hasPointerCapture(e.pointerId)) rail.releasePointerCapture(e.pointerId);
    };

    const ro = new ResizeObserver(kick);
    ro.observe(document.documentElement);
    const stopPageScroll = onPageScroll(kick);
    window.addEventListener("resize", kick, { passive: true });
    rail.addEventListener("pointerdown", down);
    rail.addEventListener("pointermove", move, { passive: false });
    rail.addEventListener("pointerup", up);
    rail.addEventListener("pointercancel", up);
    paint();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      stopPageScroll();
      window.removeEventListener("resize", kick);
      rail.removeEventListener("pointerdown", down);
      rail.removeEventListener("pointermove", move);
      rail.removeEventListener("pointerup", up);
      rail.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div
      ref={railRef}
      role="scrollbar"
      aria-label="Page scroll"
      aria-controls="top"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={0}
      aria-valuenow={0}
      className="site-scroll-rail"
    >
      <div ref={thumbRef} className="site-scroll-thumb" />
    </div>
  );
}

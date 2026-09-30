"use client";

import { useEffect, useRef } from "react";
import { FIELD_STAGE } from "./fieldPointer";

export default function DepthStage() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = ref.current?.closest<HTMLElement>("[data-depth]");
    if (!host) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Touch scrolls off the main thread; planes moved from JS would trail it (iPad landscape).
    const fine = window.matchMedia("(pointer: fine)");
    const layers = [...host.querySelectorAll<HTMLElement>("[data-sp]")];
    const speed = layers.map((el) => Number(el.dataset.sp) || 1);
    const tops: number[] = [];
    const heights: number[] = [];
    const probe = ref.current!;
    let px = -1e4;
    let py = -1e4;
    let raf = 0;
    let visible = false;

    const measure = () => {
      layers.forEach((el, i) => {
        tops[i] = el.offsetTop;
        heights[i] = el.offsetHeight;
      });
    };

    const frame = () => {
      raf = 0;
      if (still.matches || !fine.matches || !host.offsetParent) {
        FIELD_STAGE.staged = false;
        return;
      }
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight;
      layers.forEach((el, i) => {
        const centre = r.top + tops[i] + heights[i] / 2;
        if (centre < -vh || centre > 2 * vh) return;
        el.style.translate = `0px ${((centre - vh / 2) * (speed[i] - 1)).toFixed(1)}px`;
      });
      FIELD_STAGE.staged = true;
      host.dispatchEvent(new Event("field:moved"));
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };

    const onScroll = () => {
      if (px > -1e4) place(px, py);
      kick();
    };
    let chip: HTMLElement | null = null;
    const chipOf = (t: EventTarget | null) => {
      const next = (t as HTMLElement | null)?.closest?.("[data-plate-link]")?.nextElementSibling;
      return next instanceof HTMLElement && next.hasAttribute("data-chip") ? next : null;
    };
    const place = (x: number, y: number) => {
      if (!chip) return;
      const o = probe.getBoundingClientRect();
      chip.style.setProperty("--mx", `${x - o.left}px`);
      chip.style.setProperty("--my", `${y - o.top}px`);
    };
    let lit: HTMLElement | null = null;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      chip = chipOf(e.target);
      place(e.clientX, e.clientY);
      const link = (e.target as HTMLElement).closest?.<HTMLElement>("[data-plate-link]") ?? null;
      if (link === lit) return;
      lit = link;
      if (link) host.dispatchEvent(new CustomEvent("field:enter", { detail: { el: link, x: e.clientX, y: e.clientY } }));
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      place(e.clientX, e.clientY);
      px = e.clientX;
      py = e.clientY;
    };
    let pressing = false;
    const onDown = () => (pressing = true);
    const onKey = () => (pressing = false);
    const onFocus = (e: FocusEvent) => {
      if (pressing) return;
      const link = (e.target as HTMLElement).closest?.("[data-plate-link]");
      if (!link) return;
      chip = chipOf(link);
      const b = link.getBoundingClientRect();
      place(b.left - 14, b.bottom - 6);
    };
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      px = py = -1e4;
      lit = null;
    };
    const onResize = () => {
      measure();
      kick();
    };
    const onMotion = () => {
      if (still.matches) layers.forEach((el) => (el.style.translate = ""));
      kick();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    const ro = new ResizeObserver(onResize);

    measure();
    io.observe(host);
    ro.observe(host);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey, true);
    host.addEventListener("focusin", onFocus);
    host.addEventListener("pointerover", onOver, { passive: true });
    still.addEventListener("change", onMotion);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey, true);
      host.removeEventListener("focusin", onFocus);
      host.removeEventListener("pointerover", onOver);
      still.removeEventListener("change", onMotion);
    };
  }, []);

  return <span ref={ref} aria-hidden="true" className="pointer-events-none invisible fixed top-0 left-0 size-0" />;
}

"use client";

import { useEffect, useRef } from "react";
import { FIELD_POINTER } from "./fieldPointer";

const TILT = 18;
const REACH = 280;
const LEAN = 11;

export default function DepthStage() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = ref.current?.closest<HTMLElement>("[data-depth]");
    if (!host) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const layers = [...host.querySelectorAll<HTMLElement>("[data-sp]")];
    const speed = layers.map((el) => Number(el.dataset.sp) || 1);
    const tops: number[] = [];
    const heights: number[] = [];
    const lefts: number[] = [];
    const widths: number[] = [];
    const lx = layers.map(() => 0);
    const ly = layers.map(() => 0);
    const probe = ref.current!;
    let px = -1e4;
    let py = -1e4;
    let raf = 0;
    let visible = false;
    let tx = 0.5;
    let ty = 0.5;
    let mx = 0.5;
    let my = 0.5;

    const measure = () => {
      layers.forEach((el, i) => {
        tops[i] = el.offsetTop;
        heights[i] = el.offsetHeight;
        lefts[i] = el.offsetLeft;
        widths[i] = el.offsetWidth;
      });
    };

    const frame = () => {
      raf = 0;
      if (still.matches || !host.offsetParent) {
        FIELD_POINTER.k = 0;
        return;
      }
      mx += (tx - mx) * 0.08;
      my += (ty - my) * 0.08;
      let settled = Math.abs(tx - mx) < 0.001 && Math.abs(ty - my) < 0.001;
      const warm = px > -1e4 ? 1 : 0;
      FIELD_POINTER.k += (warm - FIELD_POINTER.k) * 0.12;
      if (Math.abs(warm - FIELD_POINTER.k) < 0.01) FIELD_POINTER.k = warm;
      else settled = false;
      if (px > -1e4) {
        FIELD_POINTER.x = px;
        FIELD_POINTER.y = py;
      }
      if (settled) {
        mx = tx;
        my = ty;
      }
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight;
      layers.forEach((el, i) => {
        const centre = r.top + tops[i] + heights[i] / 2;
        if (centre < -vh || centre > 2 * vh) return;
        const s = speed[i];
        const dy = (centre - vh / 2) * (s - 1);
        const dx = (0.5 - mx) * TILT * (s - 0.6);
        const tilt = (0.5 - my) * TILT * 0.5 * (s - 0.6);
        const cx = r.left + lefts[i] + widths[i] / 2 + dx;
        const cy = centre + dy + tilt;
        const d = Math.hypot(px - cx, py - cy);
        const k = d < REACH ? (1 - d / REACH) ** 2 : 0;
        const gx = d ? ((px - cx) / d) * LEAN * k : 0;
        const gy = d ? ((py - cy) / d) * LEAN * k : 0;
        lx[i] += (gx - lx[i]) * 0.1;
        ly[i] += (gy - ly[i]) * 0.1;
        if (Math.abs(gx - lx[i]) > 0.05 || Math.abs(gy - ly[i]) > 0.05) settled = false;
        el.style.translate = `${(dx + lx[i]).toFixed(1)}px ${(dy + tilt + ly[i]).toFixed(1)}px`;
      });
      host.dispatchEvent(new Event("field:moved"));
      if (!settled && visible) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };

    const onScroll = () => {
      if (px > -1e4) place(px, py);
      kick();
    };
    const place = (x: number, y: number) => {
      const o = probe.getBoundingClientRect();
      host.style.setProperty("--mx", `${x - o.left}px`);
      host.style.setProperty("--my", `${y - o.top}px`);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      place(e.clientX, e.clientY);
      px = e.clientX;
      py = e.clientY;
      tx = e.clientX / window.innerWidth;
      ty = e.clientY / window.innerHeight;
      kick();
    };
    let pressing = false;
    const onDown = () => (pressing = true);
    const onKey = () => (pressing = false);
    const onFocus = (e: FocusEvent) => {
      if (pressing) return;
      const link = (e.target as HTMLElement).closest?.("[data-plate-link]");
      if (!link) return;
      const b = link.getBoundingClientRect();
      place(b.left - 14, b.bottom - 6);
    };
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      px = py = -1e4;
      kick();
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
      still.removeEventListener("change", onMotion);
    };
  }, []);

  return <span ref={ref} aria-hidden="true" className="pointer-events-none invisible fixed top-0 left-0 size-0" />;
}

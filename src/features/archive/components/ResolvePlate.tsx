"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { SCREEN } from "@/lib/halftone";
import { PLATE, type Tile } from "../data/field";

const IN = 950;
const OUT = 480;
const HOLD = 160;

const ease = (t: number) => 1 - (1 - t) ** 3;

function pos(value = "50% 50%"): [number, number] {
  const [a, b] = value.trim().split(/\s+/);
  const one = (v: string | undefined) => {
    const n = Number.parseFloat(v ?? "50");
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n / 100)) : 0.5;
  };
  return [one(a), one(b)];
}

export default function ResolvePlate({ tile, sizes }: { tile: Tile; sizes: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const plate = PLATE[tile.shape];

  useEffect(() => {
    const el = ref.current;
    const row = el?.closest("li");
    const canvas = el?.querySelector("canvas");
    const img = el?.querySelector("img");
    if (!el || !row || !canvas || !img) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    let tone: Float32Array | null = null;
    let cols = 0;
    let rows = 0;
    let t = 0;
    let goal = 0;
    let raf = 0;
    let last = 0;
    let since = 0;

    const sample = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h || !img.complete || !img.naturalWidth) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      cols = Math.ceil(w / SCREEN);
      rows = Math.ceil(h / SCREEN);
      const src = document.createElement("canvas");
      src.width = cols;
      src.height = rows;
      const g = src.getContext("2d", { willReadFrequently: true });
      if (!g) return false;
      const s = Math.max(cols / img.naturalWidth, rows / img.naturalHeight);
      const [fx, fy] = pos(tile.focus);
      g.drawImage(img, (cols - img.naturalWidth * s) * fx, (rows - img.naturalHeight * s) * fy, img.naturalWidth * s, img.naturalHeight * s);
      const d = g.getImageData(0, 0, cols, rows).data;
      tone = new Float32Array(cols * rows);
      let lo = 1;
      let hi = 0;
      for (let i = 0; i < cols * rows; i++) {
        const v = (0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]) / 255;
        tone[i] = v;
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
      const span = Math.max(0.1, hi - lo);
      for (let i = 0; i < tone.length; i++) tone[i] = (tone[i] - lo) / span;
      return true;
    };

    const paint = () => {
      const g = canvas.getContext("2d");
      if (!g || !tone) return;
      const dpr = canvas.width / canvas.clientWidth;
      const k = ease(t);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      const style = getComputedStyle(el);
      g.fillStyle = style.getPropertyValue("--color-canvas").trim() || "#e2e2e2";
      g.globalAlpha = 1 - k;
      g.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      g.globalAlpha = 1;
      g.fillStyle = style.getPropertyValue("--color-ink").trim() || "#0f0d09";
      g.beginPath();
      const shrink = 1 - k;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const r = (1 - tone[y * cols + x]) * SCREEN * 0.52 * shrink;
          if (r < 0.25) continue;
          const cx = x * SCREEN + SCREEN / 2;
          const cy = y * SCREEN + SCREEN / 2;
          g.moveTo(cx + r, cy);
          g.arc(cx, cy, r, 0, Math.PI * 2);
        }
      }
      g.fill();
      img.style.opacity = String(k);
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? now - last : 16;
      last = now;
      if (goal === 1 && now - since < HOLD) {
        raf = requestAnimationFrame(frame);
        return;
      }
      t = goal > t ? Math.min(1, t + dt / IN) : Math.max(0, t - dt / OUT);
      paint();
      if (t !== goal) raf = requestAnimationFrame(frame);
    };

    const run = (to: number) => {
      goal = to;
      if (!tone && !sample()) {
        if (to) img.addEventListener("load", () => goal && run(goal), { once: true });
        return;
      }
      if (t === 0) paint();
      if (still.matches) {
        t = to;
        paint();
        return;
      }
      if (to) since = performance.now();
      last = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const enter = () => requestAnimationFrame(() => run(1));
    const leave = () => {
      t = 0;
      goal = 0;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (tone) paint();
    };
    row.addEventListener("pointerenter", enter);
    row.addEventListener("pointerleave", leave);
    row.addEventListener("focusin", enter);
    row.addEventListener("focusout", leave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      row.removeEventListener("pointerenter", enter);
      row.removeEventListener("pointerleave", leave);
      row.removeEventListener("focusin", enter);
      row.removeEventListener("focusout", leave);
    };
  }, [tile.focus]);

  return (
    <div
      ref={ref}
      style={{ aspectRatio: `${plate.w} / ${plate.h}` }}
      className="relative w-full overflow-hidden u-corner bg-canvas"
    >
      {tile.src ? (
        <Image
          src={tile.src}
          alt=""
          fill
          sizes={sizes}
          style={{ opacity: 0, ...(tile.focus ? { objectPosition: tile.focus } : {}) }}
          className="object-cover"
        />
      ) : null}
      <canvas aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
    </div>
  );
}

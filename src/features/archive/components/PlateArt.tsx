"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { GROUND, SCREEN, halftone } from "@/lib/halftone";
import { PLATE, type Tile } from "../data/field";

const HATCH =
  "bg-[repeating-linear-gradient(135deg,var(--color-rule-strong)_0_1px,transparent_1px_9px)]";
const FADE = "transition-opacity duration-300 ease-out motion-reduce:transition-none";

export default function PlateArt({
  tile,
  sizes,
  hover = false,
  eager = false,
  className = "",
  style,
}: {
  tile: Tile;
  sizes: string;
  hover?: boolean;
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const plate = PLATE[tile.shape];
  const [x, y, w, h] = tile.box;
  const box = { left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` };
  const loading = eager ? "eager" : undefined;
  const screen = hover && tile.kind !== "none";
  const cover = tile.kind === "photo";

  const ref = useRef<HTMLDivElement>(null);
  const [printed, setPrinted] = useState(false);

  useEffect(() => {
    if (!screen) return;
    const el = ref.current;
    const canvas = el?.querySelector("canvas");
    const img = el?.querySelector("img");
    if (!el || !canvas || !img) return;

    let alive = true;
    let width = 0;
    let timer = 0;

    const draw = async () => {
      if (!alive) return;
      if (!img.complete || !img.naturalWidth) {
        await new Promise((r) => img.addEventListener("load", r, { once: true }));
      }
      if (!alive || !canvas.clientWidth) return;
      const done = halftone(
        canvas,
        (g, cw, ch) => {
          const s = cover
            ? Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
            : Math.min((w * cw) / img.naturalWidth, (h * ch) / img.naturalHeight);
          const dw = img.naturalWidth * s;
          const dh = img.naturalHeight * s;
          const [fx, fy] = focus(tile.focus);
          g.drawImage(
            img,
            cover ? (cw - dw) * fx : x * cw + (w * cw - dw) / 2,
            cover ? (ch - dh) * fy : y * ch + (h * ch - dh) / 2,
            dw,
            dh,
          );
        },
        SCREEN,
        phase(el),
        GROUND,
      );
      if (done) {
        width = canvas.clientWidth;
        setPrinted(true);
      }
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        draw();
        ro.observe(el);
      },
      { rootMargin: "300px" },
    );
    const ro = new ResizeObserver(() => {
      if (!width || Math.abs(el.clientWidth - width) < 8) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(draw, 200);
    });
    io.observe(el);

    return () => {
      alive = false;
      window.clearTimeout(timer);
      io.disconnect();
      ro.disconnect();
    };
  }, [screen, cover, x, y, w, h, tile.focus]);

  return (
    <div
      ref={ref}
      style={{ aspectRatio: `${plate.w} / ${plate.h}`, ...style }}
      className={`relative overflow-hidden u-corner ${screen ? "bg-canvas" : "bg-surface-sunken"} ${
        tile.kind === "none" ? HATCH : ""
      } ${className}`}
    >
      {tile.kind === "lift" && tile.src ? (
        <div className="absolute" style={box}>
          <Image src={tile.src} alt="" fill sizes={sizes} loading={loading} className="object-contain" />
        </div>
      ) : null}

      {tile.kind === "photo" && tile.src ? (
        <Image
          src={tile.src}
          alt=""
          fill
          sizes={sizes}
          loading={loading}
          style={tile.focus ? { objectPosition: tile.focus } : undefined}
          className="object-cover"
        />
      ) : null}

      {screen ? (
        <canvas
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 size-full ${FADE} ${
            printed
              ? "group-hover/plate:opacity-0 group-focus-visible/plate:opacity-0"
              : "opacity-0"
          }`}
        />
      ) : null}
    </div>
  );
}

function phase(el: HTMLElement): [number, number] {
  const sheet = el.closest<HTMLElement>("[data-depth]");
  if (!sheet) return [0, 0];
  const a = el.getBoundingClientRect();
  const b = sheet.getBoundingClientRect();
  return [a.left - b.left, a.top - b.top];
}

function focus(value = "50% 50%"): [number, number] {
  const parts = value.trim().split(/\s+/);
  const one = (raw: string | undefined, fallback: number) => {
    if (!raw) return fallback;
    if (raw === "left" || raw === "top") return 0;
    if (raw === "right" || raw === "bottom") return 1;
    if (raw === "center") return 0.5;
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n / 100)) : fallback;
  };
  return [one(parts[0], 0.5), one(parts[1], 0.5)];
}

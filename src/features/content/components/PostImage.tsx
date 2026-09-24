"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { GROUND, SCREEN, coverInto, halftone } from "@/lib/halftone";

/**
 * A post's picture. With a photograph it prints through the site's screen and resolves when
 * its `group/post` is pointed at; on touch it is the photograph. Without one it is a grey
 * placeholder of the same shape.
 */
export default function PostImage({
  src,
  ratio = "4 / 3",
  sizes,
  eager = false,
  className = "",
}: {
  src?: string;
  ratio?: string;
  sizes: string;
  eager?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dots = useId();
  const [printed, setPrinted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const canvas = el?.querySelector("canvas");
    const img = el?.querySelector("img");
    if (!src || !el || !canvas || !img) return;
    let alive = true;
    const draw = async () => {
      if (!img.complete || !img.naturalWidth) {
        await new Promise((r) => img.addEventListener("load", r, { once: true }));
      }
      if (!alive || !canvas.clientWidth) return;
      if (halftone(canvas, (g, w, h) => coverInto(g, img, w, h), SCREEN, [0, 0], GROUND)) {
        setPrinted(true);
      }
    };
    draw();
    return () => {
      alive = false;
    };
  }, [src]);

  // Generated cover art is already printed in dots; it shows as it is.
  if (src?.startsWith("/blog-covers/")) {
    return (
      <div style={{ aspectRatio: ratio }} className={`relative overflow-hidden ${className}`}>
        <Image src={src} alt="" fill sizes={sizes} priority={eager} unoptimized className="object-cover" />
      </div>
    );
  }

    if (!src) {
    return (
      <svg
        aria-hidden="true"
        style={{ aspectRatio: ratio }}
        className={`block h-auto overflow-hidden text-ink ${className}`}
      >
        <defs>
          <pattern id={dots} width="6" height="6" patternUnits="userSpaceOnUse">
            <rect x="2" y="2" width="2" height="2" fill="currentColor" fillOpacity="0.22" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="currentColor" fillOpacity="0.05" />
        <rect width="100%" height="100%" fill={`url(#${dots})`} />
      </svg>
    );
  }

  return (
    <div ref={ref} style={{ aspectRatio: ratio }} className={`relative overflow-hidden bg-canvas ${className}`}>
      <Image src={src} alt="" fill sizes={sizes} loading={eager ? "eager" : undefined} className="object-cover" />
      <canvas
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 size-full transition-opacity duration-300 ease-out motion-reduce:transition-none [@media(hover:none)]:hidden ${
          printed ? "group-hover/post:opacity-0 group-focus-visible/post:opacity-0" : "opacity-0"
        }`}
      />
    </div>
  );
}

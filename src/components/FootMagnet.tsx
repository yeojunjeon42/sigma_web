"use client";

import { useEffect } from "react";
import { glide, type Glide } from "@/lib/glide";

const QUIET = 70;
const DEADZONE = 0.15;

export default function FootMagnet() {
  useEffect(() => {
    const edge = document.querySelector<HTMLElement>("[data-foot-edge]");
    if (!edge) return;
    const phone = window.matchMedia("(width < 64rem)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let pull: Glide | null = null;
    let held = false;
    let from = 0;
    let settle = 0;

    const rest = () => {
      settle = 0;
      if (held || !phone.matches || document.querySelector(".year-ruler")) return;
      const e = Math.max(0, edge.getBoundingClientRect().top + window.scrollY - window.innerHeight);
      const m = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      if (m - e < 2) return;
      if (y <= e + 3 || y >= m - 3) {
        from = y >= m - 3 ? 1 : 0;
        return;
      }
      const t = (y - e) / (m - e);
      from = Math.abs(t - from) < DEADZONE ? from : 1 - from;
      const to = from ? m : e;
      pull?.stop();
      if (still.matches) window.scrollTo({ top: to, behavior: "instant" });
      else pull = glide(to, true);
    };
    const soon = () => {
      if (pull?.settling) return;
      window.clearTimeout(settle);
      settle = window.setTimeout(rest, QUIET);
    };
    const grab = () => {
      held = true;
      window.clearTimeout(settle);
      pull?.stop();
      settle = 0;
    };
    const free = () => {
      held = false;
      soon();
    };

    window.addEventListener("scroll", soon, { passive: true });
    window.addEventListener("scrollend", soon);
    window.addEventListener("pointerdown", grab, { passive: true });
    window.addEventListener("pointerup", free, { passive: true });
    window.addEventListener("pointercancel", free, { passive: true });
    return () => {
      window.clearTimeout(settle);
      pull?.stop();
      window.removeEventListener("scroll", soon);
      window.removeEventListener("scrollend", soon);
      window.removeEventListener("pointerdown", grab);
      window.removeEventListener("pointerup", free);
      window.removeEventListener("pointercancel", free);
    };
  }, []);

  return null;
}

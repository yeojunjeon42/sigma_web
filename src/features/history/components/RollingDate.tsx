"use client";

import { useEffect, useRef } from "react";
import { useMedia } from "@/lib/media";

const LOCK_START = 500;
const LOCK_STEP = 180;
const SCRAMBLE = 45;
const TICK = 220;

const PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const p2 = (n: number) => String(n).padStart(2, "0");

const age = () => {
  const p = Object.fromEntries(PARTS.formatToParts(new Date()).map((x) => [x.type, Number(x.value)]));
  return [p.year - 1984, p.month - 1, p.day - 1, p.hour, p.minute, p.second].map(p2).join("");
};

const UNITS = ["Y", "M", "D", "H", "M", "S"];
const ROWS = [[0, 1, 2], [3, 4, 5]];
const random = () => String(Math.floor(Math.random() * 10));

export default function RollingDate({ className = "" }: { className?: string }) {
  const still = useMedia("(prefers-reduced-motion: reduce)", false);
  const box = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cells = Array.from(box.current?.querySelectorAll<HTMLElement>("[data-fig]") ?? []);
    const shown = cells.map((c) => c.textContent ?? "0");
    const until = cells.map(() => 0);
    let frame = 0;
    let clock = 0;
    let target = age();

    const paint = (now: number) => {
      let busy = false;
      cells.forEach((c, i) => {
        const locked = now >= until[i];
        const next = locked ? target[i] : random();
        if (!locked) busy = true;
        if (shown[i] !== next) {
          c.textContent = next;
          shown[i] = next;
        }
        c.dataset.spin = locked ? "" : "1";
      });
      if (busy) frame = window.setTimeout(() => paint(performance.now()), SCRAMBLE);
    };

    const tick = () => {
      const next = age();
      const now = performance.now();
      next.split("").forEach((d, i) => {
        if (d !== target[i] && !still) until[i] = now + TICK;
      });
      target = next;
      clearTimeout(frame);
      paint(now);
    };

    const start = performance.now();
    if (!still) cells.forEach((_, i) => (until[i] = start + LOCK_START + i * LOCK_STEP));
    paint(start);
    clock = window.setInterval(tick, 1000);
    return () => {
      clearTimeout(frame);
      clearInterval(clock);
    };
  }, [still]);

  return (
    <span ref={box} aria-hidden="true" className={`block whitespace-nowrap font-mono leading-none tracking-[-0.04em] tabular-nums ${className}`}>
      {ROWS.flat().map((u, i) => (
        <span key={i} className="mr-[0.32em] inline last:mr-0">
          {[0, 1].map((k) => (
            <span key={k} data-fig className="inline-block w-[0.6em] text-center data-[spin=1]:text-accent">
              0
            </span>
          ))}
          <span className="ml-[0.08em] font-sans text-caption tracking-normal text-ink-muted lowercase">{UNITS[u]}</span>
        </span>
      ))}
    </span>
  );
}

"use client";

import { useEffect, useRef } from "react";

/** Travel that turns a press into a scrub. */
const SLOP = 5;
/** Pitch of the dial, in px per entry: the ticks are evenly spaced, whatever the record did. */
const PITCH = 13;
/** Exponential loss of speed per millisecond once the finger lets go. */
const DRAG = 0.006;
/** How long the plate waits, after the reader stops, before coming back. */
const REST = 280;
/** How far the page has to run downward before the plate steps aside. */
const AWAY = 24;
/** Decorative continuation past the first and last real entry keeps the instrument balanced. */
const TAIL = 64;

export type Mark = {
  id: string;
  year: number;
  first: boolean;
  targetId?: string;
};

/**
 * The record as a dial on a plate floating at the foot of the screen (phones only, after the
 * timer in iOS's control centre). One tick per entry, evenly spaced. The record turns while the
 * year stays fixed in a true break in the strip: ticks disappear at one side and emerge from
 * the other, but are never composited under the numerals.
 * Its four numerals turn independently like counter drums. A horizontal drag coasts and
 * spring-settles on an entry; a tap springs to the place pressed. Vertical intent is left to
 * the page, which always wins.
 *
 * Per-frame work stays out of React. The page position, dial, tick emphasis and figure are all
 * written directly to the DOM, so a scrub does not render the chronology again.
 */
export default function YearRuler({
  marks,
  ariaLabel = "The record, entry by entry",
}: {
  marks: Mark[];
  ariaLabel?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const value = valueRef.current;
    const bar = barRef.current;
    if (!track || !value || !bar || marks.length === 0) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ticks = Array.from(
      track.querySelectorAll<HTMLElement>("[data-ruler-tick]"),
    );
    const wheels = Array.from(
      value.querySelectorAll<HTMLElement>("[data-year-wheel]"),
    );
    const masthead = () =>
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--masthead",
        ),
      ) * 16 || 64;

    const last = marks.length - 1;
    const clamp = (d: number) => Math.min(last, Math.max(0, d));
    const elastic = (d: number) => {
      if (d < 0) return -Math.sqrt(-d) * 0.42;
      if (d > last) return last + Math.sqrt(d - last) * 0.42;
      return d;
    };
    let at = new Float32Array(marks.length);
    let from = 0;
    let span = 1;
    let done = false;

    // Where each entry sits in the page's scroll, as a share of the record's own stretch.
    const measure = () => {
      const tops = marks.map((m) => {
        const el = document.getElementById(m.targetId ?? `e-${m.id}`);
        return el ? el.getBoundingClientRect().top + window.scrollY : NaN;
      });
      const known = tops.filter((n) => !Number.isNaN(n));
      if (known.length < 2) return;
      const head = masthead() + 8;
      from = known[0] - head;
      span = Math.max(1, known[known.length - 1] - head - from);
      let seen = 0;
      at = Float32Array.from(
        tops.map((n) => {
          if (!Number.isNaN(n)) seen = (n - head - from) / span;
          return seen;
        }),
      );
    };

    /** The place on the dial, counted in entries, that a share of the scroll stands at. */
    const dialAt = (f: number) => {
      if (f <= 0) return 0;
      if (f >= 1) return last;
      let k = 0;
      while (k < last && at[k + 1] <= f) k++;
      const room = at[k + 1] - at[k];
      return k + (room > 0 ? Math.min(1, (f - at[k]) / room) : 0);
    };
    /** And back: the share of the scroll that a place on the dial stands at. */
    const scrollAt = (d: number) => {
      if (last === 0) return 0;
      const k = Math.min(last - 1, Math.max(0, Math.floor(d)));
      return at[k] + (d - k) * (at[k + 1] - at[k]);
    };
    const here = () => dialAt((window.scrollY - from) / span);

    let frame = 0;
    let motion = 0;
    let shown = true;
    let entry = -1;
    let paintedDial = 0;
    let commandedY = window.scrollY;
    let commandedAt = 0;
    let displayedYear = String(marks[0].year);
    let yearGeneration = 0;

    const show = (on: boolean) => {
      const next = on && !done;
      if (next === shown) return;
      shown = next;
      bar.dataset.on = next ? "1" : "";
    };

    const changeYear = (i: number, direction: number) => {
      const year = String(marks[i].year);
      if (displayedYear === year) return;

      const from = displayedYear.padStart(wheels.length, "0");
      const to = year.padStart(wheels.length, "0");
      displayedYear = year;
      value.dataset.year = year;
      const generation = ++yearGeneration;
      const sign = direction >= 0 ? 1 : -1;
      wheels.forEach((wheel, position) => {
        const current = wheel.querySelector<HTMLElement>("[data-year-current]");
        const next = wheel.querySelector<HTMLElement>("[data-year-next]");
        if (!current || !next) return;

        current.getAnimations().forEach((animation) => animation.cancel());
        next.getAnimations().forEach((animation) => animation.cancel());
        current.textContent = from[position];
        next.textContent = "";

        if (from[position] === to[position] || still) {
          current.textContent = to[position];
          return;
        }

        next.textContent = to[position];
        const delay = (wheels.length - 1 - position) * 12;
        const outgoing = current.animate(
          [
            { opacity: 1, transform: "translateY(0) rotateX(0deg)" },
            {
              opacity: 0.58,
              transform: `translateY(${-sign * 100}%) rotateX(${sign * 58}deg)`,
            },
          ],
          {
            duration: 260,
            delay,
            easing: "cubic-bezier(0.45, 0, 0.55, 1)",
            fill: "both",
          },
        );
        const incoming = next.animate(
          [
            {
              opacity: 0.58,
              transform: `translateY(${sign * 100}%) rotateX(${-sign * 58}deg)`,
            },
            { opacity: 1, transform: "translateY(0) rotateX(0deg)" },
          ],
          {
            duration: 260,
            delay,
            easing: "cubic-bezier(0.45, 0, 0.55, 1)",
            fill: "both",
          },
        );
        incoming.onfinish = () => {
          if (generation !== yearGeneration) return;
          current.textContent = to[position];
          next.textContent = "";
          outgoing.cancel();
          incoming.cancel();
        };
      });
    };

    /** Paint at a fractional entry. */
    const paintAt = (d: number) => {
      paintedDial = d;
      const centre = bar.clientWidth / 2;
      const stationHalf = value.parentElement?.clientWidth
        ? value.parentElement.clientWidth / 2
        : 46;
      track.style.transform = `translate3d(${centre - d * PITCH}px,0,0)`;

      ticks.forEach((tick) => {
        const i = Number(tick.dataset.rulerIndex);
        const distance = Math.abs(i - d);
        const x = (i - d) * PITCH;
        const fromStation = Math.abs(x) - stationHalf;
        const magnet = Math.max(0, Math.min(1, 1 - fromStation / (PITCH * 2)));
        const wantedPull = -Math.sign(x) * magnet * 5;
        // The magnetic tick approaches the counter but never enters its cut-out. Its last few
        // pixels fade before the hard mask, so the station does not appear to shear the rule.
        const pulledX = x + wantedPull;
        const safeX =
          fromStation >= 0
            ? Math.sign(x) * Math.max(stationHalf + 3, Math.abs(pulledX))
            : pulledX;
        const pull = safeX - x;
        const boundary = Math.max(
          0,
          Math.min(1, (Math.abs(safeX) - stationHalf) / 9),
        );
        const lean = -Math.sign(x) * magnet * 4;
        const focus = Math.max(0, 1 - distance / 9);
        const selected = Math.max(0, 1 - distance / 0.65);
        const passed = i <= d;
        const alpha =
          Math.min(
            1,
            (passed ? 0.68 : 0.44) +
              focus * (passed ? 0.3 : 0.34) +
              magnet * 0.08,
          ) * (fromStation >= 0 ? boundary : 0);
        const mark = marks[i];
        const color =
          magnet > 0.02
            ? "var(--color-accent)"
            : mark?.first
              ? "var(--color-accent-deep)"
              : !mark
                ? "color-mix(in srgb, var(--color-accent) 34%, var(--color-ink-muted) 66%)"
                : passed
                  ? "color-mix(in srgb, var(--color-accent) 78%, var(--color-ink) 22%)"
                  : "color-mix(in srgb, var(--color-accent) 46%, var(--color-ink-muted) 54%)";
        tick.style.setProperty("--tick-alpha", alpha.toFixed(3));
        tick.style.setProperty(
          "--tick-scale",
          (1 + focus * 0.1 + selected * 0.18 + magnet * 0.3).toFixed(3),
        );
        tick.style.setProperty("--tick-color", color);
        tick.style.setProperty("--tick-x", `${pull.toFixed(2)}px`);
        tick.style.setProperty("--tick-lean", `${lean.toFixed(2)}deg`);
      });
      const i = Math.round(clamp(d));
      if (i !== entry) {
        const direction = entry < 0 ? 1 : i - entry;
        entry = i;
        bar.setAttribute("aria-valuenow", String(i));
        bar.setAttribute("aria-valuetext", String(marks[i].year));
        changeYear(i, direction);
      }

      const tail = document.getElementById(
        marks[last].targetId ?? `e-${marks[last].id}`,
      );
      const over = !!tail && tail.getBoundingClientRect().bottom <= 0;
      if (over !== done) {
        done = over;
        show(!over);
      }
    };

    const paint = () => {
      frame = 0;
      paintAt(here());
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    let pageFrame = 0;
    let pageTarget = window.scrollY;
    let pageVelocity = 0;
    let pageThen = performance.now();

    const stopPage = () => {
      if (pageFrame) cancelAnimationFrame(pageFrame);
      pageFrame = 0;
      pageVelocity = 0;
      commandedAt = -Infinity;
    };

    /** Retarget one page spring instead of starting a new smooth-scroll animation per tick. */
    const movePage = (target: number) => {
      const limit = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      pageTarget = Math.min(limit, Math.max(0, target));
      if (still) {
        commandedY = target;
        commandedAt = performance.now();
        window.scrollTo({ top: target, behavior: "instant" });
        return;
      }
      if (pageFrame) return;

      pageThen = performance.now();
      const run = (now: number) => {
        const dt = Math.min(0.032, Math.max(0.008, (now - pageThen) / 1000));
        pageThen = now;
        const y = window.scrollY;
        const acceleration = (pageTarget - y) * 220 - pageVelocity * 30;
        pageVelocity += acceleration * dt;
        const next = y + pageVelocity * dt;

        if (Math.abs(pageTarget - next) < 0.35 && Math.abs(pageVelocity) < 5) {
          commandedY = pageTarget;
          commandedAt = now;
          window.scrollTo({ top: pageTarget, behavior: "instant" });
          pageFrame = 0;
          pageVelocity = 0;
          return;
        }

        commandedY = next;
        commandedAt = now;
        window.scrollTo({ top: next, behavior: "instant" });
        pageFrame = requestAnimationFrame(run);
      };
      pageFrame = requestAnimationFrame(run);
    };

    /** The strip remains continuous under the finger, while the page spring is quantized to the
     * entry carried by the nearest tick. */
    const put = (d: number, visual = d) => {
      const detent = Math.round(clamp(d));
      movePage(from + scrollAt(detent) * span);
      paintAt(visual);
    };

    const stopDial = () => {
      if (motion) cancelAnimationFrame(motion);
      motion = 0;
    };
    const stop = () => {
      stopDial();
      stopPage();
    };

    /** A damped spring shared by taps, keys, edge returns and the final coast settle. */
    const spring = (to: number, start = paintedDial, velocity = 0) => {
      stopDial();
      const target = clamp(to);
      if (still) {
        put(target);
        return;
      }
      let x = start;
      let v = velocity * 1000;
      let then = performance.now();
      const run = (now: number) => {
        const dt = Math.min(0.032, Math.max(0.008, (now - then) / 1000));
        then = now;
        const acceleration = (target - x) * 240 - v * 29;
        v += acceleration * dt;
        x += v * dt;
        put(x, elastic(x));
        if (Math.abs(target - x) < 0.002 && Math.abs(v) < 0.015) {
          put(target);
          motion = 0;
          return;
        }
        motion = requestAnimationFrame(run);
      };
      motion = requestAnimationFrame(run);
    };

    let press: {
      id: number;
      x: number;
      y: number;
      d: number;
      lastD: number;
      lastT: number;
      live: boolean;
    } | null = null;
    let velocity = 0;

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      stop();
      velocity = 0;
      const now = performance.now();
      const d = paintedDial;
      press = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        d,
        lastD: d,
        lastT: now,
        live: false,
      };
      bar.dataset.pressed = "1";
      bar.setPointerCapture(e.pointerId);
      show(true);
      bar.focus({ preventScroll: true });
    };
    const move = (e: PointerEvent) => {
      if (!press || press.id !== e.pointerId) return;
      const dx = e.clientX - press.x;
      const dy = e.clientY - press.y;
      if (!press.live) {
        if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          press = null;
          delete bar.dataset.pressed;
          return;
        }
        press.live = true;
        bar.dataset.dragging = "1";
      }

      e.preventDefault();
      const now = performance.now();
      const d = press.d - dx / PITCH;
      const dt = Math.max(8, now - press.lastT);
      const instant = (d - press.lastD) / dt;
      velocity = velocity * 0.68 + instant * 0.32;
      press.lastD = d;
      press.lastT = now;
      put(d, elastic(d));
    };

    const release = (e: PointerEvent) => {
      const was = press;
      press = null;
      delete bar.dataset.pressed;
      delete bar.dataset.dragging;
      if (!was || was.id !== e.pointerId) return;
      if (bar.hasPointerCapture(e.pointerId))
        bar.releasePointerCapture(e.pointerId);

      if (!was.live) {
        const r = bar.getBoundingClientRect();
        const to = Math.round(
          was.d + (e.clientX - (r.left + r.width / 2)) / PITCH,
        );
        spring(to, was.d);
        return;
      }

      const d = was.lastD;
      if (d < 0 || d > last) spring(clamp(d), d, velocity);
      else if (!still && Math.abs(velocity) > 0.0025) {
        let x = d;
        let v = velocity;
        let then = performance.now();
        const coast = (now: number) => {
          const dt = Math.min(32, Math.max(8, now - then));
          then = now;
          x += v * dt;
          v *= Math.exp(-DRAG * dt);
          if (x <= 0 || x >= last) {
            spring(clamp(x), x, v);
            return;
          }
          put(x);
          if (Math.abs(v) < 0.0025) spring(Math.round(x), x, v);
          else motion = requestAnimationFrame(coast);
        };
        motion = requestAnimationFrame(coast);
      } else {
        spring(Math.round(clamp(d)), d, velocity);
      }
    };
    const cancel = (e: PointerEvent) => {
      if (!press || press.id !== e.pointerId) return;
      press = null;
      delete bar.dataset.pressed;
      delete bar.dataset.dragging;
      spring(Math.round(paintedDial));
    };

    const key = (e: KeyboardEvent) => {
      const keys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      show(true);
      if (e.key === "Home") spring(0);
      else if (e.key === "End") spring(last);
      else {
        const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
        spring(Math.round(paintedDial) + (forward ? 1 : -1));
      }
    };

    // The reader's own scrolling always wins while it is moving. Once its momentum ends inside
    // the record, the same spring as the dial draws the page to the nearest real entry.
    let lastY = window.scrollY;
    let rest = 0;
    let nativeRest = 0;
    let readerHeld = false;
    const settleNative = () => {
      nativeRest = 0;
      if (readerHeld || press || pageFrame || motion) return;
      const f = (window.scrollY - from) / span;
      if (f < 0 || f > 1) return;
      const d = here();
      const target = Math.round(clamp(d));
      if (Math.abs(target - d) < 0.002) return;
      show(true);
      spring(target, d);
    };
    const scheduleNative = () => {
      window.clearTimeout(nativeRest);
      nativeRest = window.setTimeout(settleNative, 140);
    };
    const onScroll = () => {
      const y = window.scrollY;
      const ours =
        performance.now() - commandedAt < 120 && Math.abs(y - commandedY) < 2;
      if (ours) {
        lastY = y;
        return;
      }
      kick();
      stop();
      if (y > lastY + AWAY) show(false);
      else if (y < lastY - 8) show(true);
      lastY = y;
      window.clearTimeout(rest);
      rest = window.setTimeout(() => show(true), REST);
      scheduleNative();
    };
    const away = (e: Event) => {
      if (!press && !bar.contains(e.target as Node)) {
        stop();
        window.clearTimeout(nativeRest);
      }
    };
    const holdPage = (e: TouchEvent) => {
      if (bar.contains(e.target as Node)) return;
      readerHeld = true;
      away(e);
    };
    const freePage = () => {
      if (!readerHeld) return;
      readerHeld = false;
      scheduleNative();
    };

    const ro = new ResizeObserver(() => {
      measure();
      paintAt(here());
    });
    const host = document
      .getElementById(marks[0].targetId ?? `e-${marks[0].id}`)
      ?.closest("main");
    if (host) ro.observe(host);

    measure();
    paintAt(here());
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", away, { passive: true });
    window.addEventListener("touchstart", holdPage, { passive: true });
    window.addEventListener("touchend", freePage, { passive: true });
    window.addEventListener("touchcancel", freePage, { passive: true });
    window.addEventListener("keydown", away);
    bar.addEventListener("pointerdown", down);
    bar.addEventListener("pointermove", move, { passive: false });
    bar.addEventListener("pointerup", release);
    bar.addEventListener("pointercancel", cancel);
    bar.addEventListener("keydown", key);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      stop();
      window.clearTimeout(rest);
      window.clearTimeout(nativeRest);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", away);
      window.removeEventListener("touchstart", holdPage);
      window.removeEventListener("touchend", freePage);
      window.removeEventListener("touchcancel", freePage);
      window.removeEventListener("keydown", away);
      bar.removeEventListener("pointerdown", down);
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", release);
      bar.removeEventListener("pointercancel", cancel);
      bar.removeEventListener("keydown", key);
    };
  }, [marks]);

  if (marks.length === 0) return null;

  const ticks = Array.from({ length: marks.length + TAIL * 2 }, (_, slot) => {
    const index = slot - TAIL;
    return { index, mark: marks[index] };
  });

  return (
    <div
      ref={barRef}
      data-overlay
      data-on="1"
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={marks.length - 1}
      aria-valuenow={0}
      aria-valuetext={String(marks[0].year)}
      className="year-ruler"
    >
      <div className="year-ruler__window" aria-hidden="true">
        <div ref={trackRef} className="year-ruler__track">
          {ticks.map(({ index, mark }) => (
            <span
              key={index}
              data-ruler-tick
              data-ruler-index={index}
              data-major={mark?.first ? "1" : undefined}
              style={{ left: `${index * PITCH}px` }}
              className="year-ruler__tick"
            />
          ))}
        </div>

        <span className="year-ruler__edge-blur year-ruler__edge-blur--left" />
        <span className="year-ruler__edge-blur year-ruler__edge-blur--right" />
      </div>

      {/* One instrument, one row: the moving strip has a true break for this fixed counter. The
          year itself is the index, so there is no second pointer. */}
      <div aria-hidden="true" className="year-ruler__value-slot">
        <p
          ref={valueRef}
          data-year={marks[0].year}
          className="year-ruler__value"
        >
          {String(marks[0].year)
            .padStart(4, "0")
            .split("")
            .map((digit, position) => (
              <span
                key={position}
                data-year-wheel
                className="year-ruler__digit"
              >
                <span data-year-current>{digit}</span>
                <span data-year-next />
              </span>
            ))}
        </p>
      </div>
    </div>
  );
}

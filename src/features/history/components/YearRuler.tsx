"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const SLOP = 5;
const PITCH = 13;
const TAIL = 28;
const ROOM = 3;
const GIVE = 0.42;
const REST = 280;
const AWAY = 24;
const LAND = 140;
const QUIET = 120;
const LOST = 1600;
const FLING = 160;
const EDGE = [1, 2 / 3, 1 / 3, 1 / 12, 0].map((q) => q * ROOM);
const PANES = ["past", "ahead", "past-pull", "ahead-pull"];
const KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];

type Line = "page" | "dial";
type Timeline = new (options: {
  source: Element;
  axis: "block" | "x";
}) => AnimationTimeline;

export type Mark = {
  id: string;
  year: number;
  first: boolean;
  targetId?: string;
};

export default function YearRuler({
  marks,
  ariaLabel = "The record, entry by entry",
}: {
  marks: Mark[];
  ariaLabel?: string;
}) {
  const valueRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const value = valueRef.current;
    const bar = barRef.current;
    const scroller = scrollerRef.current;
    if (!value || !bar || !scroller || marks.length === 0) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = still ? "instant" : "smooth";
    const tracks = Array.from(
      bar.querySelectorAll<HTMLElement>("[data-ruler-track]"),
    );
    const wheels = Array.from(
      value.querySelectorAll<HTMLElement>("[data-year-wheel]"),
    );
    const Scroll = (window as unknown as { ScrollTimeline?: Timeline })
      .ScrollTimeline;
    const masthead = () =>
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--masthead",
        ),
      ) * 16 || 64;
    const bottom = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const last = marks.length - 1;
    const clamp = (d: number) => Math.min(last, Math.max(0, d));
    const bend = (d: number) => {
      if (d < 0) return -Math.sqrt(-d) * GIVE;
      if (d > last) return last + Math.sqrt(d - last) * GIVE;
      return d;
    };
    let at = new Float32Array(marks.length);
    let from = 0;
    let span = 1;
    let limit = 0;
    let done = false;
    let centre = 0;
    let tailBottom = Infinity;
    let footTop = Infinity;

    const measure = () => {
      centre = bar.clientWidth / 2;
      limit = bottom();
      const tail = document.getElementById(
        marks[last].targetId ?? `e-${marks[last].id}`,
      );
      tailBottom = tail
        ? tail.getBoundingClientRect().bottom + window.scrollY
        : Infinity;
      const foot = document.querySelector("footer")?.parentElement;
      footTop = foot ? foot.getBoundingClientRect().top + window.scrollY : Infinity;
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
          if (!Number.isNaN(n)) seen = Math.max(seen, (n - head - from) / span);
          return seen;
        }),
      );
    };

    const dialAt = (f: number) => {
      if (f <= 0) return 0;
      if (f >= 1) return last;
      let k = 0;
      while (k < last && at[k + 1] <= f) k++;
      const room = at[k + 1] - at[k];
      return k + (room > 0 ? Math.min(1, (f - at[k]) / room) : 0);
    };
    const scrollAt = (d: number) => {
      if (last === 0) return 0;
      const k = Math.min(last - 1, Math.max(0, Math.floor(d)));
      return at[k] + (d - k) * (at[k + 1] - at[k]);
    };
    const here = () => dialAt((window.scrollY - from) / span);
    const dialOf = () => scroller.scrollLeft / PITCH - ROOM;
    const xAt = (d: number) =>
      `translate3d(${(centre - (d + TAIL + 0.5) * PITCH).toFixed(2)}px,0,0)`;

    const pageFrames = (): Keyframe[] => {
      if (limit <= 0) return [];
      const points: [number, number][] = [[0, dialAt(-from / span)]];
      at.forEach((f, k) => {
        const y = from + f * span;
        if (y > 0 && y < limit) points.push([y, k]);
      });
      points.push([limit, dialAt((limit - from) / span)]);
      return points.map(([y, d]) => ({ offset: y / limit, transform: xAt(d) }));
    };
    const dialFrames = (): Keyframe[] => {
      const reach = scroller.scrollWidth - scroller.clientWidth;
      if (reach <= 0) return [];
      return [...EDGE.map((u) => -u), ...EDGE.map((u) => last + u).reverse()].map(
        (d) => ({
          offset: Math.min(1, ((ROOM + d) * PITCH) / reach),
          transform: xAt(bend(d)),
        }),
      );
    };

    let line: Line = "page";
    const pageRuns: Animation[] = [];
    const dialRuns: Animation[] = [];
    if (Scroll) {
      const pageLine = new Scroll({
        source: document.documentElement,
        axis: "block",
      });
      const dialLine = new Scroll({ source: scroller, axis: "x" });
      tracks.forEach((track) => {
        pageRuns.push(track.animate([], { timeline: pageLine, fill: "both" }));
        dialRuns.push(track.animate([], { timeline: dialLine, fill: "both" }));
      });
      dialRuns.forEach((run) => run.cancel());
    }
    const set = (runs: Animation[], frames: Keyframe[]) =>
      runs.forEach((run) => (run.effect as KeyframeEffect).setKeyframes(frames));

    let frame = 0;
    const paint = () => {
      frame = 0;
      const x = xAt(line === "page" ? here() : bend(dialOf()));
      tracks.forEach((track) => (track.style.transform = x));
    };
    const kick = () => {
      if (!pageRuns.length && !frame) frame = requestAnimationFrame(paint);
    };
    const drive = (next: Line) => {
      line = next;
      if (next === "dial") set(dialRuns, dialFrames());
      dialRuns.forEach((run) => (next === "dial" ? run.play() : run.cancel()));
      kick();
    };

    let shown = true;
    let entry = -1;
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

    const read = (d: number) => {
      const i = Math.round(clamp(d));
      if (i === entry) return;
      const direction = entry < 0 ? 1 : i - entry;
      entry = i;
      bar.setAttribute("aria-valuenow", String(i));
      bar.setAttribute("aria-valuetext", String(marks[i].year));
      changeYear(i, direction);
    };

    let touch: { id: number; x: number; y: number; axis: "" | "x" | "y" } | null =
      null;
    let mouse: {
      id: number;
      x: number;
      s: number;
      t: number;
      v: number;
      live: boolean;
    } | null = null;
    let dragged = false;
    let moving = false;
    let aim = -1;
    let glideTo: number | null = null;
    let ourY = NaN;
    let ourAt = -Infinity;
    let quiet = 0;
    let lost = 0;
    let lastY = window.scrollY;
    let rest = 0;
    let nativeRest = 0;
    let readerHeld = false;
    const held = () => (!!touch && touch.axis !== "y") || !!mouse;
    const busy = () => held() || moving || glideTo !== null;

    const judge = (using: boolean) => {
      const y = window.scrollY;
      const over =
        tailBottom - y <= 0 ||
        (!using && y + window.innerHeight > footTop);
      if (over === done) return;
      done = over;
      show(!over);
    };

    const landed = () => {
      window.clearTimeout(lost);
      if (glideTo === null) return;
      ourY = glideTo;
      ourAt = performance.now();
      glideTo = null;
    };
    const glide = (k: number) => {
      const y = Math.min(bottom(), Math.max(0, from + scrollAt(k) * span));
      if (Math.abs((glideTo ?? window.scrollY) - y) < 0.5) return;
      glideTo = y;
      window.clearTimeout(lost);
      lost = window.setTimeout(landed, LOST);
      window.scrollTo({ top: y, behavior });
    };

    const grab = () => {
      window.clearTimeout(nativeRest);
      show(true);
      if (line === "dial") return;
      scroller.scrollTo({ left: (ROOM + here()) * PITCH, behavior: "instant" });
      drive("dial");
      read(dialOf());
    };
    const drop = () => {
      window.clearTimeout(quiet);
      window.clearTimeout(lost);
      moving = false;
      aim = -1;
      glideTo = null;
      if (line === "page") return;
      delete bar.dataset.free;
      drive("page");
      read(here());
    };
    const choose = (d: number) => {
      const k = Math.round(clamp(d));
      aim = k;
      scroller.scrollTo({ left: (ROOM + k) * PITCH, behavior });
      glide(k);
    };

    const settle = () => {
      window.clearTimeout(quiet);
      moving = false;
      aim = -1;
      if (line !== "dial") return;
      if (!mouse) delete bar.dataset.free;
      glide(Math.round(clamp(dialOf())));
    };
    const onDial = () => {
      if (line !== "dial") return;
      moving = true;
      read(dialOf());
      kick();
      window.clearTimeout(quiet);
      quiet = window.setTimeout(settle, QUIET);
    };
    const dialEnd = () => {
      if (line === "dial" && !held()) settle();
    };

    const settleNative = () => {
      nativeRest = 0;
      if (readerHeld || touch || mouse || glideTo !== null || line === "dial")
        return;
      const f = (window.scrollY - from) / span;
      if (f < 0 || f > 1) return;
      const d = here();
      const target = Math.round(clamp(d));
      if (Math.abs(target - d) < 0.002) return;
      show(true);
      glide(target);
    };
    const scheduleNative = () => {
      window.clearTimeout(nativeRest);
      nativeRest = window.setTimeout(settleNative, LAND);
    };
    const touchDown = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (touch || !t) return;
      touch = { id: t.identifier, x: t.clientX, y: t.clientY, axis: "" };
      bar.dataset.pressed = "1";
      grab();
      bar.focus({ preventScroll: true });
    };
    const touchMove = (e: TouchEvent) => {
      if (!touch || touch.axis) return;
      const id = touch.id;
      const t = Array.from(e.changedTouches).find((c) => c.identifier === id);
      if (!t) return;
      const dx = t.clientX - touch.x;
      const dy = t.clientY - touch.y;
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        touch.axis = "y";
        delete bar.dataset.pressed;
        drop();
        return;
      }
      touch.axis = "x";
      bar.dataset.dragging = "1";
    };
    const touchUp = (e: TouchEvent) => {
      if (!touch) return;
      const id = touch.id;
      if (!Array.from(e.changedTouches).some((c) => c.identifier === id)) return;
      const axis = touch.axis;
      touch = null;
      delete bar.dataset.pressed;
      delete bar.dataset.dragging;
      if (axis === "y") scheduleNative();
      else if (line === "dial" && !moving) settle();
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      grab();
      mouse = {
        id: e.pointerId,
        x: e.clientX,
        s: scroller.scrollLeft,
        t: performance.now(),
        v: 0,
        live: false,
      };
      dragged = false;
      bar.dataset.pressed = "1";
      bar.setPointerCapture(e.pointerId);
      bar.focus({ preventScroll: true });
    };
    const move = (e: PointerEvent) => {
      if (!mouse || mouse.id !== e.pointerId) return;
      const dx = e.clientX - mouse.x;
      if (!mouse.live) {
        if (Math.abs(dx) < SLOP) return;
        mouse.live = true;
        dragged = true;
        bar.dataset.dragging = "1";
        bar.dataset.free = "1";
      }
      e.preventDefault();
      const now = performance.now();
      const was = scroller.scrollLeft;
      scroller.scrollLeft = mouse.s - dx;
      const instant = (scroller.scrollLeft - was) / Math.max(8, now - mouse.t);
      mouse.v = mouse.v * 0.68 + instant * 0.32;
      mouse.t = now;
    };
    const up = (e: PointerEvent) => {
      if (!mouse || mouse.id !== e.pointerId) return;
      const was = mouse;
      mouse = null;
      delete bar.dataset.pressed;
      delete bar.dataset.dragging;
      if (bar.hasPointerCapture(e.pointerId))
        bar.releasePointerCapture(e.pointerId);
      if (!was.live) return;
      const fling = still || e.type === "pointercancel" ? 0 : was.v * FLING;
      choose(dialOf() + fling / PITCH);
    };

    const tap = (e: MouseEvent) => {
      if (dragged) {
        dragged = false;
        return;
      }
      grab();
      const r = bar.getBoundingClientRect();
      choose(dialOf() + (e.clientX - (r.left + r.width / 2)) / PITCH);
    };

    const key = (e: KeyboardEvent) => {
      if (!KEYS.includes(e.key)) return;
      e.preventDefault();
      grab();
      const base = aim >= 0 ? aim : Math.round(clamp(dialOf()));
      if (e.key === "Home") choose(0);
      else if (e.key === "End") choose(last);
      else {
        const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
        choose(base + (forward ? 1 : -1));
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      const ours =
        held() ||
        glideTo !== null ||
        (performance.now() - ourAt < 120 && Math.abs(y - ourY) < 2);
      if (glideTo !== null && Math.abs(y - glideTo) < 1) landed();
      if (line === "page" || !ours) {
        if (!ours) drop();
        read(here());
        kick();
      }
      judge(ours || busy());
      if (ours) {
        lastY = y;
        return;
      }
      if (y > lastY + AWAY) show(false);
      else if (y < lastY - 8) show(true);
      lastY = y;
      window.clearTimeout(rest);
      rest = window.setTimeout(() => show(true), REST);
      scheduleNative();
    };
    const away = (e: Event) => {
      if (bar.contains(e.target as Node)) return;
      drop();
      window.clearTimeout(nativeRest);
    };
    const wheel = (e: WheelEvent) => {
      if (!bar.contains(e.target as Node)) return away(e);
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) grab();
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

    const refit = () => {
      measure();
      set(pageRuns, pageFrames());
      if (line === "dial") set(dialRuns, dialFrames());
      read(line === "page" ? here() : dialOf());
      paint();
      judge(busy());
    };
    const ro = new ResizeObserver(refit);
    const host = document
      .getElementById(marks[0].targetId ?? `e-${marks[0].id}`)
      ?.closest("main");
    if (host) ro.observe(host);
    ro.observe(bar);

    refit();
    window.addEventListener("resize", refit);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", wheel, { passive: true });
    window.addEventListener("touchstart", holdPage, { passive: true });
    window.addEventListener("touchend", freePage, { passive: true });
    window.addEventListener("touchcancel", freePage, { passive: true });
    window.addEventListener("keydown", away);
    scroller.addEventListener("scroll", onDial, { passive: true });
    scroller.addEventListener("scrollend", dialEnd);
    bar.addEventListener("touchstart", touchDown, { passive: true });
    bar.addEventListener("touchmove", touchMove, { passive: true });
    bar.addEventListener("touchend", touchUp, { passive: true });
    bar.addEventListener("touchcancel", touchUp, { passive: true });
    bar.addEventListener("pointerdown", down);
    bar.addEventListener("pointermove", move, { passive: false });
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
    bar.addEventListener("click", tap);
    bar.addEventListener("keydown", key);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      [...pageRuns, ...dialRuns].forEach((run) => run.cancel());
      window.clearTimeout(quiet);
      window.clearTimeout(lost);
      window.clearTimeout(rest);
      window.clearTimeout(nativeRest);
      ro.disconnect();
      window.removeEventListener("resize", refit);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", holdPage);
      window.removeEventListener("touchend", freePage);
      window.removeEventListener("touchcancel", freePage);
      window.removeEventListener("keydown", away);
      scroller.removeEventListener("scroll", onDial);
      scroller.removeEventListener("scrollend", dialEnd);
      bar.removeEventListener("touchstart", touchDown);
      bar.removeEventListener("touchmove", touchMove);
      bar.removeEventListener("touchend", touchUp);
      bar.removeEventListener("touchcancel", touchUp);
      bar.removeEventListener("pointerdown", down);
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
      bar.removeEventListener("pointercancel", up);
      bar.removeEventListener("click", tap);
      bar.removeEventListener("keydown", key);
    };
  }, [marks]);

  if (marks.length === 0) return null;

  const tail = Array.from({ length: TAIL }, (_, i) => <span key={i} />);
  const ticks = (
    <>
      <span data-tail="">{tail}</span>
      <span>
        {marks.map((mark, i) => (
          <span key={i} data-major={mark.first ? "" : undefined} />
        ))}
      </span>
      <span data-tail="">{tail}</span>
    </>
  );

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
      style={
        {
          "--ruler-pitch": `${PITCH}px`,
          "--ruler-room": `${ROOM * PITCH}px`,
        } as CSSProperties
      }
    >
      <div className="year-ruler__window" aria-hidden="true">
        {PANES.map((pane) => (
          <div key={pane} className={`year-ruler__pane year-ruler__pane--${pane}`}>
            <div className="year-ruler__lens">
              <div data-ruler-track className="year-ruler__track">
                {ticks}
              </div>
            </div>
          </div>
        ))}

        <span className="year-ruler__edge-blur year-ruler__edge-blur--left" />
        <span className="year-ruler__edge-blur year-ruler__edge-blur--right" />
      </div>

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

      <div
        ref={scrollerRef}
        tabIndex={-1}
        aria-hidden="true"
        className="year-ruler__scroller"
      >
        <div className="year-ruler__rail">
          {marks.map((_, i) => (
            <span key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

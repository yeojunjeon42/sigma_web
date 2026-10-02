"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { glide, type Glide } from "@/lib/glide";
import { spring } from "@/lib/spring";

const SLOP = 5;
const PITCH = 13;
const ROOM = 3;
const GIVE = 0.42;
const FLIP = 12;
const QUIET = 120;
const STATION = 96;
const CHIP = 70;
const CHIP_H = 34;
const LIST = 0.65;
const FAST = 2800;
const SLOW = 1100;
const PROJECT = 0.42;
const FRAME = 1000 / 60;
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
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const value = valueRef.current;
    const bar = barRef.current;
    const scroller = scrollerRef.current;
    const picker = pickerRef.current;
    if (!value || !bar || !scroller || !picker || marks.length === 0) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tracks = Array.from(
      bar.querySelectorAll<HTMLElement>("[data-ruler-track]"),
    );
    const wheels = Array.from(
      value.querySelectorAll<HTMLElement>("[data-year-wheel]"),
    );
    const Scroll = (window as unknown as { ScrollTimeline?: Timeline })
      .ScrollTimeline;
    const masthead = () => {
      const root = getComputedStyle(document.documentElement);
      return (
        parseFloat(root.getPropertyValue("--masthead")) *
          parseFloat(root.fontSize) || 64
      );
    };
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
    let leadTop = -Infinity;
    let foldS = 1;
    let foldX = 1;
    let foldDx = 0;
    let foldMid = 1;
    let foldLift = 0;

    const measure = () => {
      centre = bar.clientWidth / 2;
      limit = bottom();
      // Scale the caps uniformly and keep the middle overlapped by 1px at each end.
      const w = Math.max(1, bar.clientWidth);
      const h = Math.max(1, bar.clientHeight);
      foldS = CHIP_H / h;
      foldX = CHIP / w;
      foldDx = (w - CHIP) / 2;
      foldMid = (CHIP - CHIP_H + 2) / Math.max(1, w - h + 2);
      foldLift = (h - CHIP_H) / 2;
      bar.style.setProperty("--fold-s", foldS.toFixed(4));
      bar.style.setProperty("--fold-x", foldX.toFixed(4));
      bar.style.setProperty("--fold-dx", `${foldDx.toFixed(2)}px`);
      bar.style.setProperty("--fold-mid", foldMid.toFixed(4));
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
      leadTop = known[0];
      const head = masthead() + 8;
      let seen = known[0] - head;
      const rests = tops.map((n) => {
        if (!Number.isNaN(n)) seen = Math.max(seen, n - head);
        return seen;
      });
      // Distribute trailing entries across the remaining scroll before the footer.
      const end = Math.min(limit, footTop - window.innerHeight);
      const j = rests.findIndex((r) => r > end);
      if (j > 0) {
        const base = rests[j - 1];
        const n = last - j + 1;
        for (let i = 1; i <= n; i++) rests[j - 1 + i] = base + ((end - base) * i) / n;
      }
      from = rests[0];
      span = Math.max(1, rests[last] - from);
      at = Float32Array.from(rests.map((r) => (r - from) / span));
      // Distribute entries sharing a row across the preceding scroll interval so every tick moves.
      for (let i = 1; i <= last; ) {
        let j = i;
        while (j < last && at[j + 1] === at[i]) j++;
        const n = j - i + 1;
        const before = at[i - 1];
        for (let m = 0; m < n - 1; m++) at[i + m] -= ((n - 1 - m) / n) * (at[i] - before);
        i = j + 1;
      }
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
      `translate3d(${(centre - (d + 0.5) * PITCH).toFixed(2)}px,0,0)`;

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
    let dialLine: AnimationTimeline | null = null;
    let pageLine: AnimationTimeline | null = null;
    if (Scroll) {
      pageLine = new Scroll({
        source: document.documentElement,
        axis: "block",
      });
      dialLine = new Scroll({ source: scroller, axis: "x" });
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

    let shown = false;
    let entry = -1;
    let displayedYear = String(marks[0].year);
    let rolled = displayedYear;
    let rolling = false;
    let spins: Animation[] = [];
    let spin = 0;
    let hurry = false;
    let turn = 1;

    const show = (on: boolean) => {
      const next = on && !done;
      if (next === shown) return;
      shown = next;
      bar.dataset.on = next ? "1" : "";
    };

    const roll = () => {
      const from = rolled.padStart(wheels.length, "0");
      const to = displayedYear.padStart(wheels.length, "0");
      rolled = displayedYear;
      const runs: Animation[] = [];
      const mine = ++spin;
      wheels.forEach((wheel, position) => {
        const current = wheel.querySelector<HTMLElement>("[data-year-current]");
        const next = wheel.querySelector<HTMLElement>("[data-year-next]");
        if (!current || !next) return;

        current.textContent = from[position];
        next.textContent = "";

        if (from[position] === to[position] || still || hurry) {
          current.textContent = to[position];
          return;
        }

        next.textContent = to[position];
        const delay = (wheels.length - 1 - position) * 12;
        runs.push(
          current.animate(
            [
              { opacity: 1, transform: "translateY(0) rotateX(0deg)" },
              {
                opacity: 0.58,
                transform: `translateY(${-turn * 100}%) rotateX(${turn * 58}deg)`,
              },
            ],
            {
              duration: 260,
              delay,
              easing: "cubic-bezier(0.45, 0, 0.55, 1)",
              fill: "both",
            },
          ),
          next.animate(
            [
              {
                opacity: 0.58,
                transform: `translateY(${turn * 100}%) rotateX(${-turn * 58}deg)`,
              },
              { opacity: 1, transform: "translateY(0) rotateX(0deg)" },
            ],
            {
              duration: 260,
              delay,
              easing: "cubic-bezier(0.45, 0, 0.55, 1)",
              fill: "both",
            },
          ),
        );
      });
      if (!runs.length) return;
      rolling = true;
      spins = runs;
      Promise.all(runs.map((run) => run.finished)).then(
        () => {
          if (mine !== spin) return;
          wheels.forEach((wheel, position) => {
            const current = wheel.querySelector<HTMLElement>("[data-year-current]");
            const next = wheel.querySelector<HTMLElement>("[data-year-next]");
            if (current) current.textContent = to[position];
            if (next) next.textContent = "";
          });
          runs.forEach((run) => run.cancel());
          rolling = false;
          if (rolled !== displayedYear) roll();
        },
        () => {
          if (mine === spin) rolling = false;
        },
      );
    };

    // Finish each digit roll before showing the latest year; update immediately during fast scrubbing.
    const changeYear = (i: number, direction: number) => {
      const year = String(marks[i].year);
      if (displayedYear === year) return;
      displayedYear = year;
      value.dataset.year = year;
      turn = direction >= 0 ? 1 : -1;
      if (rolling && hurry) {
        spin++;
        spins.forEach((run) => run.cancel());
        rolling = false;
      }
      if (!rolling) roll();
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

    let touch: {
      id: number;
      x: number;
      y: number;
      scroll: number;
      axis: "" | "x" | "y";
    } | null = null;
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
    let target = NaN;
    let pull: Glide | null = null;
    let quiet = 0;
    let slid: Animation[] = [];
    let slidFrom = 0;
    let stops: number[] = [];
    let slope: number[] = [];
    let fast = false;
    let speed = 0;
    let lastPage = NaN;
    let lastAt = 0;
    let folded = false;
    let expanding = false;
    let tappedAt = -Infinity;
    let open = false;
    let landing = NaN;
    let refitLater = false;
    let lastY = window.scrollY;
    let turnY = lastY;
    let goingDown = false;
    let fit = 0;
    const held = () => (!!touch && touch.axis !== "y") || !!mouse;
    const pulling = () => !!pull?.settling;
    const busy = () => held() || moving || pulling();

    // Hide outside the record; defer footer dismissal while the dial is in use.
    const judge = (using: boolean) => {
      const y = window.scrollY;
      const over =
        y + window.innerHeight * LIST < leadTop ||
        tailBottom - y <= 0 ||
        (!using && y + window.innerHeight > footTop + 1);
      done = over;
      show(!over);
    };

    const pageAt = (d: number) =>
      Math.min(bottom(), Math.max(0, from + scrollAt(clamp(d)) * span));
    // Reuse one spring while the dial updates its target.
    const aimPage = (y: number) => {
      target = y;
      if (still) {
        if (Math.abs(window.scrollY - y) >= 0.5) window.scrollTo({ top: y, behavior: "instant" });
        return;
      }
      if (!pulling()) pull = glide(() => target);
    };

    // Use ScrollTimeline translations for compositor-rate motion; scripted iPhone scroll is capped at 60Hz.
    // Translate siblings, never the dial's ancestors. land() converts the translation to native scroll.
    const flowOf = () => {
      const main = bar.parentElement;
      const page = main?.parentElement;
      if (!main || !page) return [];
      return [...main.children, ...page.children].filter(
        (el): el is HTMLElement =>
          el instanceof HTMLElement &&
          el !== bar &&
          el !== main &&
          getComputedStyle(el).position !== "fixed",
      );
    };
    const curveAt = (d: number) => {
      const c = clamp(d);
      const k = Math.min(last - 1, Math.floor(c));
      if (k < 0) return stops[0];
      const t = c - k;
      return (
        (2 * t ** 3 - 3 * t ** 2 + 1) * stops[k] +
        (t ** 3 - 2 * t ** 2 + t) * slope[k] +
        (-2 * t ** 3 + 3 * t ** 2) * stops[k + 1] +
        (t ** 3 - t ** 2) * slope[k + 1]
      );
    };
    // Dim rapid scrubbing to prevent strobing between entries.
    const quick = (on: boolean) => {
      if (on === fast) return;
      fast = hurry = on;
      if (on) document.documentElement.dataset.fast = "";
      else delete document.documentElement.dataset.fast;
    };

    const slide = () => {
      const reach = scroller.scrollWidth - scroller.clientWidth;
      if (!dialLine || still || slid.length || reach <= 0) return;
      const flow = flowOf();
      if (!flow.length) return;
      pull?.stop();
      const base = window.scrollY;
      const px = 1 / window.devicePixelRatio;
      stops = marks.map((_, k) => Math.round(pageAt(k) / px) * px);
      // Fritsch–Carlson interpolation keeps speed continuous without overshooting entries.
      const rise = stops.slice(1).map((y, k) => y - stops[k]);
      slope = stops.map((_, k) => {
        const a = rise[k - 1] ?? rise[k] ?? 0;
        const b = rise[k] ?? a;
        return a > 0 && b > 0 ? (a + b) / 2 : 0;
      });
      rise.forEach((r, k) => {
        if (r <= 0) return;
        const p = slope[k] / r;
        const q = slope[k + 1] / r;
        const h = Math.hypot(p, q);
        if (h <= 3) return;
        slope[k] = (3 / h) * p * r;
        slope[k + 1] = (3 / h) * q * r;
      });
      const ease = (k: number) => {
        const r = rise[k];
        if (!r || r <= 0) return "linear";
        const a = (slope[k] / r / 3).toFixed(4);
        const b = (1 - slope[k + 1] / r / 3).toFixed(4);
        return `cubic-bezier(0.3333, ${a}, 0.6667, ${b})`;
      };
      const offset = (d: number) => Math.min(1, Math.max(0, ((ROOM + d) * PITCH) / reach));
      const shift = (y: number) => `0 ${(base - y).toFixed(3)}px`;
      const frames: Keyframe[] = [
        { offset: 0, translate: shift(stops[0]) },
        ...stops.map((y, k) => ({ offset: offset(k), translate: shift(y), easing: ease(k) })),
        { offset: 1, translate: shift(stops[last]) },
      ];
      slidFrom = base;
      speed = 0;
      lastPage = NaN;
      document.documentElement.dataset.slide = "";
      flow.forEach((el) => (el.dataset.flow = ""));
      slid = flow.map((el) => el.animate(frames, { timeline: dialLine, fill: "both" }));
      // Start both animations this frame; a default scroll-timeline start waits one frame.
      const percent = (window.CSS as { percent?: (n: number) => CSSNumberish } | undefined)?.percent;
      if (percent) slid.forEach((run) => (run.startTime = percent(0)));
      // Ease from the current page position; the new timeline has no computed value until next frame.
      const gap = curveAt(dialOf()) - base;
      if (Math.abs(gap) < 1) return;
      const { values, duration } = spring(gap, 0, 0, 0.5, 1);
      const settling = values.map((g, i) => ({
        translate: `0 ${g.toFixed(3)}px`,
        offset: i / (values.length - 1),
      }));
      flow.forEach((el) => slid.push(el.animate(settling, { duration, composite: "add" })));
    };
    const land = () => {
      if (!slid.length) return;
      // Commit the combined slide and easing translation to native scroll.
      const el = (slid[0].effect as KeyframeEffect).target;
      const moved = el ? getComputedStyle(el).translate.split(" ") : [];
      const px = 1 / window.devicePixelRatio;
      const y = Math.round((slidFrom - (parseFloat(moved[1] ?? "0") || 0)) / px) * px;
      slid.forEach((run) => run.cancel());
      slid = [];
      delete document.documentElement.dataset.slide;
      quick(false);
      target = y;
      if (Math.abs(window.scrollY - y) >= 0.5) {
        landing = y;
        window.scrollTo({ top: y, behavior: "instant" });
      }
      if (refitLater) {
        refitLater = false;
        refitSoon();
      }
    };

    // Collapse after FLIP px of downward scroll; reverse with the current spring velocity.
    // At rest, data-mini controls the collapsed appearance and hit area.
    const parts = {
      mid: bar.querySelector<HTMLElement>(".year-ruler__pill > [data-mid]"),
      start: bar.querySelector<HTMLElement>('.year-ruler__pill > [data-end="start"]'),
      end: bar.querySelector<HTMLElement>('.year-ruler__pill > [data-end="end"]'),
      window: bar.querySelector<HTMLElement>(".year-ruler__window"),
      value,
    };
    // p: 0 = open, 1 = collapsed. Linear transforms keep the capsule pieces joined.
    const look = (p: number): Record<keyof typeof parts, Keyframe> => {
      const s = 1 + (foldS - 1) * p;
      return {
        mid: { scale: `${1 + (foldMid - 1) * p} ${s}` },
        start: { translate: `${foldDx * p}px 0`, scale: `${s}` },
        end: { translate: `${-foldDx * p}px 0`, scale: `${s}` },
        window: {
          opacity: Math.min(1, Math.max(0, 1 - p / 0.35)),
          scale: `${1 + (foldX - 1) * p} ${s}`,
        },
        value: { translate: `0 ${foldLift * p}px`, scale: `${s}` },
      };
    };
    let folding: Animation[] = [];
    let foldGoal = 0;
    let foldRun: { values: number[]; start: number } | null = null;
    const unfold = () => {
      folding.forEach((run) => run.cancel());
      folding = [];
      foldRun = null;
    };
    // Preserve velocity (progress/s) when reversing the fold.
    const foldSpeed = () => {
      if (!foldRun) return 0;
      const i = Math.floor((performance.now() - foldRun.start) / FRAME);
      const { values } = foldRun;
      if (i < 0 || i >= values.length - 1) return 0;
      return (values[i + 1] - values[i]) * 60;
    };
    const progress = () => {
      if (!parts.start || foldDx <= 0) return folded ? 1 : 0;
      const x = parseFloat(getComputedStyle(parts.start).translate) || 0;
      return Math.min(1, Math.max(0, x / foldDx));
    };
    // Suppress transitions while committing the final appearance and hit area.
    const state = (mini: boolean) => {
      folded = mini;
      bar.dataset.still = "";
      if (mini) bar.dataset.mini = "1";
      else delete bar.dataset.mini;
      void getComputedStyle(bar).opacity;
      delete bar.dataset.still;
    };
    const commit = (to: number) => {
      unfold();
      state(to === 1);
    };
    const settleFold = (to: number, velocity = foldSpeed()) => {
      const p = progress();
      foldGoal = to;
      unfold();
      // Restore the full hit area as opening starts; keep it until collapse finishes.
      if (!to && folded) state(false);
      if (still || (Math.abs(p - to) < 0.002 && Math.abs(velocity) < 0.05)) return commit(to);
      const { values, duration } = to
        ? spring(p, 1, velocity, 0.38, 0.92)
        : spring(p, 0, velocity, 0.44, 0.78);
      const looks = values.map(look);
      const runs = (Object.keys(parts) as (keyof typeof parts)[]).flatMap((key) => {
        const el = parts[key];
        return el
          ? [
              el.animate(
                looks.map((l, i) => ({ ...l[key], offset: i / (looks.length - 1) })),
                { duration, fill: "forwards" },
              ),
            ]
          : [];
      });
      folding = runs;
      foldRun = { values, start: performance.now() };
      Promise.all(runs.map((run) => run.finished)).then(
        () => {
          if (folding === runs) commit(to);
        },
        () => {},
      );
    };
    const fold = (on: boolean) => {
      if (on) years(false);
      if ((on ? 1 : 0) === foldGoal && (folding.length || folded === on)) return;
      settleFold(on ? 1 : 0);
    };
    const years = (on: boolean) => {
      if (on === open) return;
      open = on;
      picker.dataset.open = on ? "1" : "";
      picker.inert = !on;
      if (!on) return;
      picker.querySelectorAll<HTMLElement>("[data-k]").forEach((b) => {
        if (b.dataset.year === displayedYear) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
    };
    const jump = (k: number) => {
      years(false);
      halt();
      land();
      pull?.stop();
      const y = pageAt(k);
      const go = () => {
        if (line === "dial") scroller.scrollTo({ left: (ROOM + k) * PITCH, behavior: "instant" });
        target = y;
        if (Math.abs(window.scrollY - y) >= 0.5) {
          landing = y;
          window.scrollTo({ top: y, behavior: "instant" });
        }
        read(k);
      };
      const flow = flowOf();
      if (still || !flow.length) return go();
      const out = flow.map((el) =>
        el.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 140,
          easing: "ease-in",
          fill: "forwards",
        }),
      );
      Promise.all(out.map((run) => run.finished)).then(
        () => {
          go();
          flow.forEach((el) =>
            el.animate([{ opacity: 0, translate: "0 14px" }, { opacity: 1, translate: "0 0" }], {
              duration: 420,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            }),
          );
          out.forEach((run) => run.cancel());
        },
        () => {},
      );
    };

    const grab = () => {
      show(true);
      fold(false);
      if (line === "dial") return;
      scroller.scrollTo({ left: (ROOM + here()) * PITCH, behavior: "instant" });
      drive("dial");
      read(dialOf());
    };
    const drop = () => {
      window.clearTimeout(quiet);
      halt();
      land();
      pull?.stop();
      target = NaN;
      moving = false;
      aim = -1;
      if (line === "page") return;
      delete bar.dataset.free;
      drive("page");
      read(here());
    };
    // Replace native momentum with compositor keyframes so ticks and page coast together.
    // Taps and keys snap to a tick; a released drag stops freely within the bounds.
    let coasting: {
      ticks: Animation[];
      page: Animation[];
      values: number[];
      start: number;
      raf: number;
    } | null = null;
    // Sample finger and dial motion; scroll events cover gaps in touch events.
    let trail: [number, number][] = [];
    let turns: [number, number][] = [];
    const recent = (samples: [number, number][], at: number) => {
      const near = samples.filter(([t]) => at - t <= 100);
      if (near.length < 2) return null;
      const [t0, a] = near[0];
      const [t1, b] = near[near.length - 1];
      if (t1 <= t0 || at - t1 > 50) return { v: 0, n: near.length };
      return { v: ((b - a) / (t1 - t0)) * 1000, n: near.length };
    };
    // Release speed in ticks/s.
    const letGo = (at: number) => {
      const byFinger = recent(trail, at);
      const byDial = recent(turns, at);
      if (byFinger && (!byDial || byFinger.n >= byDial.n)) return -byFinger.v / PITCH;
      return byDial ? byDial.v : 0;
    };
    const coastAt = () => {
      if (!coasting) return dialOf();
      const i = Math.round((performance.now() - coasting.start) / FRAME);
      return coasting.values[Math.min(coasting.values.length - 1, Math.max(0, i))];
    };
    // Hold the final frame until the scroll timeline catches up to the scripted scroll.
    const release = (runs: Animation[]) =>
      requestAnimationFrame(() => requestAnimationFrame(() => runs.forEach((run) => run.cancel())));
    const halt = () => {
      if (!coasting) return;
      const d = coastAt();
      const was = coasting;
      coasting = null;
      cancelAnimationFrame(was.raf);
      scroller.scrollLeft = (ROOM + d) * PITCH;
      [...was.ticks, ...was.page].forEach((run) => run.cancel());
    };
    const arrive = (k: number) => {
      const was = coasting;
      coasting = null;
      if (was) cancelAnimationFrame(was.raf);
      scroller.scrollLeft = (ROOM + k) * PITCH;
      moving = false;
      read(k);
      // Cancel page animation now; release tick animation after its timeline catches up.
      was?.page.forEach((run) => run.cancel());
      if (was) release(was.ticks);
      // Preserve the translated position unless a specific entry was selected.
      const sliding = slid.length > 0;
      land();
      if (!sliding || Number.isInteger(k)) aimPage(pageAt(k));
    };
    const coast = (to: number, v = 0, snap = true) => {
      halt();
      const d0 = dialOf();
      const k = snap ? Math.round(clamp(to)) : clamp(to);
      const gap = k - d0;
      if (still || (Math.abs(gap) < 0.002 && Math.abs(v) < 0.05)) return arrive(k);
      // A scripted position stops native momentum. Keep scrolling enabled so iOS accepts new touches.
      scroller.scrollLeft = (ROOM + d0) * PITCH;
      let values: number[];
      if (v * gap > 0) {
        const tau = Math.min(0.6, Math.max(0.12, gap / v));
        values = [];
        for (let t = 0; t < 2.5; t += 1 / 60) {
          values.push(k - gap * Math.exp(-t / tau));
          // Free motion stops below ~9px/s; snapping reaches the exact target.
          const step = ((Math.abs(gap) * Math.exp(-t / tau)) / tau / 60) * PITCH;
          if (snap ? Math.abs(gap) * Math.exp(-t / tau) < 0.003 : step < 0.15) break;
        }
        if (snap) values.push(k);
      } else values = spring(d0, k, v, 0.34, 1).values;
      const n = values.length - 1;
      const duration = n * FRAME;
      const ticks = tracks.map((track) =>
        track.animate(
          values.map((d, i) => ({ transform: xAt(bend(d)), offset: i / n })),
          { duration, fill: "forwards" },
        ),
      );
      const page: Animation[] = [];
      if (slid.length) {
        // Include any unfinished entry easing in the coast.
        const easing = slid.filter((run) => run.timeline !== dialLine);
        const flow = [...new Set(slid.map((run) => (run.effect as KeyframeEffect).target))].filter(
          (el): el is Element => !!el,
        );
        const shown = flow[0] ? parseFloat(getComputedStyle(flow[0]).translate.split(" ")[1] ?? "0") || 0 : 0;
        const rest = shown - (slidFrom - curveAt(d0));
        easing.forEach((run) => run.cancel());
        slid = slid.filter((run) => !easing.includes(run));
        const frames = values.map((d, i) => ({
          translate: `0 ${(slidFrom - curveAt(d) + rest * (1 - i / n)).toFixed(3)}px`,
          offset: i / n,
        }));
        flow.forEach((el) => page.push(el.animate(frames, { duration, fill: "forwards" })));
      }
      const step = () => {
        if (!coasting || coasting.ticks !== ticks) return;
        const d = coastAt();
        scroller.scrollLeft = (ROOM + d) * PITCH;
        read(d);
        if (slid.length) {
          const now = performance.now();
          const y = curveAt(d);
          if (!Number.isNaN(lastPage)) {
            speed = speed * 0.5 + ((Math.abs(y - lastPage) / Math.max(4, now - lastAt)) * 1000) * 0.5;
            quick(speed > FAST || (fast && speed > SLOW));
          }
          lastPage = y;
          lastAt = now;
        } else if (!dialLine) aimPage(pageAt(d));
        coasting.raf = requestAnimationFrame(step);
      };
      coasting = { ticks, page, values, start: performance.now(), raf: requestAnimationFrame(step) };
      Promise.all(ticks.map((run) => run.finished)).then(
        () => {
          if (coasting?.ticks === ticks) arrive(values[n]);
        },
        () => {},
      );
    };

    const choose = (d: number) => {
      const k = Math.round(clamp(d));
      aim = k;
      if (!coasting && Math.abs(scroller.scrollLeft - (ROOM + k) * PITCH) < 0.5)
        return aimPage(pageAt(k));
      slide();
      coast(k);
    };

    const settle = () => {
      window.clearTimeout(quiet);
      moving = false;
      // Hold the page while a finger rests on the dial.
      if (held() || coasting) return;
      aim = -1;
      if (line !== "dial") return;
      if (!mouse) delete bar.dataset.free;
      const d = clamp(dialOf());
      if (Math.abs(d - dialOf()) > 0.002) return coast(d, 0, false);
      const sliding = slid.length > 0;
      land();
      if (!sliding) aimPage(pageAt(d));
    };
    const onDial = (e: Event) => {
      if (line !== "dial" || coasting) return;
      moving = true;
      turns.push([e.timeStamp, dialOf()]);
      while (turns.length > 2 && e.timeStamp - turns[0][0] > 120) turns.shift();
      read(dialOf());
      if (slid.length) {
        const now = performance.now();
        const y = curveAt(dialOf());
        if (!Number.isNaN(lastPage)) {
          const v = (Math.abs(y - lastPage) / Math.max(4, now - lastAt)) * 1000;
          speed = speed * 0.5 + v * 0.5;
          quick(speed > FAST || (fast && speed > SLOW));
        }
        lastPage = y;
        lastAt = now;
      } else if (!dialLine || still) aimPage(pageAt(dialOf()));
      kick();
      window.clearTimeout(quiet);
      quiet = window.setTimeout(settle, QUIET);
    };
    const dialEnd = () => {
      if (line === "dial" && !held() && !coasting) settle();
    };

    const touchDown = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      // Recover if the browser drops touchend.
      if (touch && !Array.from(e.touches).some((c) => c.identifier === touch?.id)) touch = null;
      if (touch || !t) return;
      if (folded) {
        expanding = true;
        fold(false);
        return;
      }
      touch = {
        id: t.identifier,
        x: t.clientX,
        y: t.clientY,
        scroll: 0,
        axis: "",
      };
      bar.dataset.pressed = "1";
      halt();
      trail = [[e.timeStamp, t.clientX]];
      turns = [];
      grab();
      touch.scroll = scroller.scrollLeft;
      bar.focus({ preventScroll: true });
    };
    const touchMove = (e: TouchEvent) => {
      if (!touch) return;
      if (e.touches.length > 1) {
        touch.axis = "y";
        delete bar.dataset.pressed;
        delete bar.dataset.dragging;
        drop();
        return;
      }
      const id = touch.id;
      const t = Array.from(e.changedTouches).find((c) => c.identifier === id);
      if (!t) return;
      trail.push([e.timeStamp, t.clientX]);
      while (trail.length > 2 && e.timeStamp - trail[0][0] > 120) trail.shift();
      const dx = t.clientX - touch.x;
      if (!touch.axis) {
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
        years(false);
        slide();
      }
      if (touch.axis !== "x") return;
      e.preventDefault();
      scroller.scrollLeft = touch.scroll - dx;
    };
    const touchUp = (e: TouchEvent) => {
      if (!touch) return;
      const id = touch.id;
      const t = Array.from(e.changedTouches).find((c) => c.identifier === id);
      if (!t) return;
      const axis = touch.axis;
      dragged = Math.abs(t.clientX - touch.x) >= SLOP;
      touch = null;
      delete bar.dataset.pressed;
      delete bar.dataset.dragging;
      if (axis === "x" && line === "dial") {
        const v = e.type === "touchcancel" ? 0 : letGo(e.timeStamp);
        coast(dialOf() + v * PROJECT, v, false);
      }
      // Detect taps from touch events: moving the scroller can suppress the browser's click.
      if (axis === "" && !dragged) {
        tappedAt = performance.now();
        tapAt(t.clientX);
      }
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (folded) {
        expanding = true;
        fold(false);
        return;
      }
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
        years(false);
        slide();
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
      const v = still || e.type === "pointercancel" ? 0 : (was.v * 1000) / PITCH;
      coast(dialOf() + v * PROJECT, v, false);
    };

    const tapAt = (x: number) => {
      const r = bar.getBoundingClientRect();
      const off = x - (r.left + r.width / 2);
      if (Math.abs(off) <= STATION / 2) return years(!open);
      years(false);
      grab();
      choose(dialOf() + off / PITCH);
    };
    const tap = (e: MouseEvent) => {
      if (expanding) {
        expanding = false;
        return;
      }
      if (dragged) {
        dragged = false;
        return;
      }
      if (performance.now() - tappedAt < 800) return;
      tapAt(e.clientX);
    };
    const pick = (e: MouseEvent) => {
      const b = (e.target as Element).closest<HTMLElement>("[data-k]");
      if (b) jump(Number(b.dataset.k));
    };

    const key = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fold(false);
        return years(!open);
      }
      if (e.key === "Escape") return years(false);
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
      // Ignore delayed scroll events from our own spring or slide landing.
      const ours =
        held() ||
        pulling() ||
        (line === "dial" && Math.abs(y - target) < 2) ||
        Math.abs(y - landing) < 2;
      landing = NaN;
      if (line === "page" || !ours) {
        if (!ours) drop();
        read(here());
        kick();
      }
      judge(ours || busy());
      if (ours) {
        lastY = turnY = y;
        return;
      }
      if (y !== lastY && y > lastY !== goingDown) {
        goingDown = y > lastY;
        turnY = lastY;
      }
      if (y <= 0) fold(false);
      else if (goingDown && y - turnY > FLIP) fold(true);
      else if (!goingDown && turnY - y > FLIP) fold(false);
      lastY = y;
    };
    const away = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key === "Escape") years(false);
      if (bar.contains(e.target as Node) || picker.contains(e.target as Node)) return;
      years(false);
      drop();
    };
    const wheel = (e: WheelEvent) => {
      if (!bar.contains(e.target as Node)) return away(e);
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) grab();
    };

    const refit = () => {
      measure();
      set(pageRuns, pageFrames());
      if (line === "dial") set(dialRuns, dialFrames());
      read(line === "page" ? here() : dialOf());
      paint();
      judge(busy());
    };
    // Throttle browser-bar resize events to one refit per frame; defer measurement until slide landing.
    const refitSoon = () => {
      if (!fit) fit = requestAnimationFrame(() => {
        fit = 0;
        if (slid.length) refitLater = true;
        else refit();
      });
    };
    const ro = new ResizeObserver(refitSoon);
    const lead = document.getElementById(
      marks[0].targetId ?? `e-${marks[0].id}`,
    );
    const host = lead?.closest("main");
    const arrived = (e: AnimationEvent) => {
      // Ignore scroll-driven animationend events; only route arrival requires refitting.
      if (e.animationName === "arrive" && (e.target as Element).contains(lead)) refitSoon();
    };
    if (host) ro.observe(host);
    ro.observe(bar);
    host?.addEventListener("animationend", arrived);

    refit();
    window.addEventListener("resize", refitSoon);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", wheel, { passive: true });
    window.addEventListener("touchstart", away, { passive: true });
    window.addEventListener("keydown", away);
    scroller.addEventListener("scroll", onDial, { passive: true });
    scroller.addEventListener("scrollend", dialEnd);
    bar.addEventListener("touchstart", touchDown, { passive: true });
    bar.addEventListener("touchmove", touchMove, { passive: false });
    bar.addEventListener("touchend", touchUp, { passive: true });
    bar.addEventListener("touchcancel", touchUp, { passive: true });
    bar.addEventListener("pointerdown", down);
    bar.addEventListener("pointermove", move, { passive: false });
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
    bar.addEventListener("click", tap);
    bar.addEventListener("keydown", key);
    picker.addEventListener("click", pick);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      cancelAnimationFrame(fit);
      if (coasting) cancelAnimationFrame(coasting.raf);
      [
        ...pageRuns,
        ...dialRuns,
        ...slid,
        ...folding,
        ...(coasting?.ticks ?? []),
        ...(coasting?.page ?? []),
      ].forEach((run) => run.cancel());
      delete document.documentElement.dataset.slide;
      delete document.documentElement.dataset.fast;
      flowOf().forEach((el) => delete el.dataset.flow);
      pull?.stop();
      window.clearTimeout(quiet);
      ro.disconnect();
      host?.removeEventListener("animationend", arrived);
      window.removeEventListener("resize", refitSoon);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", away);
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
      picker.removeEventListener("click", pick);
    };
  }, [marks]);

  if (marks.length === 0) return null;

  // Keep first occurrences in record order; archive eras are not necessarily chronological.
  const newest = marks[0].year >= marks[marks.length - 1].year;
  const firsts = marks
    .flatMap((mark, k) =>
      marks.findIndex((m) => m.year === mark.year) === k ? [{ year: mark.year, k }] : [],
    )
    .sort((a, b) => (newest ? b.year - a.year : a.year - b.year));
  const ticks = (
    <span>
      {marks.map((mark, i) => (
        <span key={i} data-major={mark.first ? "" : undefined} />
      ))}
    </span>
  );

  return (
    <>
      <div
        ref={barRef}
        data-overlay
        data-on=""
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
            "--ruler-station": `${STATION}px`,
            "--ruler-chip": `${CHIP}px`,
            "--ruler-chip-h": `${CHIP_H}px`,
          } as CSSProperties
        }
      >
        <div className="year-ruler__pill" aria-hidden="true">
          <span data-mid="" />
          <span data-end="start" />
          <span data-end="end" />
        </div>

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
          className="year-ruler__scroller u-scroll-x"
        >
          <div className="year-ruler__rail">
            {marks.map((_, i) => (
              <span key={i} />
            ))}
          </div>
        </div>
      </div>

      <div
        ref={pickerRef}
        data-overlay
        data-open=""
        inert
        role="group"
        aria-label="Years"
        className="year-picker"
      >
        {firsts.map(({ year, k }) => (
          <button
            key={year}
            type="button"
            data-k={k}
            data-year={year}
            className="year-picker__year"
          >
            {year}
          </button>
        ))}
      </div>
    </>
  );
}

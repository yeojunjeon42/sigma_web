"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Archive", href: "/archive" },
  { label: "History", href: "/history" },
  { label: "Members", href: "/members" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const INVERT = "text-white before:bg-white/[0.14]";

// Desktop scroll thresholds (px).
const STEP = 6;
const TOP = 96;
// Scroll-timeline direction threshold (px), progress threshold and idle delay (ms).
const TURN = 8;
const NUDGE = 0.16;
const QUIET = 100;
const SETTLE = "cubic-bezier(0.32, 0.72, 0, 1)";

type Timeline = new (options: { source: Element; axis: "block" }) => AnimationTimeline;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// p: 0 = visible, 1 = hidden.
const look = (p: number, h: number): Keyframe => ({
  transform: `translate3d(0, ${(-p * h).toFixed(2)}px, 0)`,
});

const flip = (bar: HTMLElement, top: number) => {
  let last = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    if (Math.abs(y - last) <= STEP) return;
    if (y > last && y > top) bar.dataset.away = "";
    else delete bar.dataset.away;
    last = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
};

const follow = (bar: HTMLElement, Scroll: Timeline) => {
  const line = new Scroll({ source: document.documentElement, axis: "block" });
  const percent = (window.CSS as { percent?: (n: number) => CSSNumberish } | undefined)?.percent;
  const limit = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const now = () => {
    const t = line.currentTime;
    if (typeof CSSUnitValue !== "undefined" && t instanceof CSSUnitValue && t.unit === "percent") {
      return clamp01(t.value / 100);
    }
    const end = limit();
    return end > 0 ? clamp01(window.scrollY / end) : 0;
  };

  let run: Animation | null = null;
  let kind: "ramp" | "settle" | null = null;
  let aim = 0;
  let away = false;
  let h = bar.offsetHeight || 56;
  let end = limit();
  // Normalized timeline bounds for the visible and hidden states.
  let shown = 0;
  let gone = 1;
  let heading = 0;
  let lastY = Math.min(end, Math.max(0, window.scrollY));
  let edge = lastY;
  let touching = false;
  let quiet = 0;

  const progress = () => {
    if (!run) return away ? 1 : 0;
    const transform = getComputedStyle(bar).transform;
    const y = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
    return clamp01(-y / h);
  };
  // Suppress transitions while committing the animation's final state.
  const commit = (state: number) => {
    const next = state >= 1;
    if (!run && away === next) return;
    run?.cancel();
    run = null;
    kind = null;
    away = next;
    bar.style.transition = "none";
    if (next) bar.dataset.away = "";
    else delete bar.dataset.away;
    void getComputedStyle(bar).transform;
    bar.style.transition = "";
  };
  const ramp = () => {
    run?.cancel();
    const span = gone - shown;
    const at = (f: number) => clamp01((f - shown) / span);
    const fs = [0, shown, gone, 1]
      .map(clamp01)
      .sort((a, b) => a - b)
      .filter((f, i, all) => i === 0 || f > all[i - 1]);
    run = bar.animate(
      fs.map((f) => ({ ...look(at(f), h), offset: f })),
      { timeline: line, fill: "both" },
    );
    // Start this frame instead of waiting for the timeline's next update.
    if (percent) run.startTime = percent(0);
    kind = "ramp";
  };
  const track = (dir: number) => {
    heading = dir;
    const p = progress();
    if (dir > 0 ? p >= 1 : p <= 0) return commit(dir > 0 ? 1 : 0);
    end = limit();
    if (end <= 0) return commit(0);
    h = bar.offsetHeight || h;
    const f = now();
    const d = h / end;
    shown = f - p * d;
    gone = shown + d;
    if (dir < 0 && shown < 0) {
      if (f <= 0) return commit(0);
      shown = 0;
      gone = f / p;
    }
    ramp();
    settle(dir > 0 ? 1 : 0);
  };
  const settle = (state: number) => {
    if (kind === "settle" && aim === state) return;
    const p = progress();
    if (Math.abs(p - state) < 0.01) return commit(state);
    run?.cancel();
    const mine = bar.animate([look(p, h), look(state, h)], {
      duration: 180 + 220 * Math.abs(state - p),
      easing: SETTLE,
      fill: "forwards",
    });
    run = mine;
    kind = "settle";
    aim = state;
    mine.finished.then(
      () => {
        if (run === mine) commit(state);
      },
      () => {},
    );
  };
  // Use an idle timer: scripted glides can fire scrollend every frame.
  const rested = () => {
    window.clearTimeout(quiet);
    if (touching || kind !== "ramp") return;
    const p = progress();
    if (heading > 0) settle(p < NUDGE ? 0 : 1);
    else settle(p > 1 - NUDGE ? 1 : 0);
  };

  const onScroll = () => {
    window.clearTimeout(quiet);
    quiet = window.setTimeout(rested, QUIET);
    const y = Math.min(limit(), Math.max(0, window.scrollY));
    if (y <= 0) {
      heading = 0;
      lastY = edge = 0;
      return settle(0);
    }
    const dir = Math.sign(y - lastY);
    const jump = Math.abs(y - lastY) > h;
    lastY = y;
    if (!dir) return;
    if (dir === heading) edge = dir > 0 ? Math.max(edge, y) : Math.min(edge, y);
    const ahead = dir > 0 ? 1 : 0;
    if (kind === "settle" && aim === ahead) {
      if (dir !== heading) edge = y;
      heading = dir;
      return;
    }
    // Ease across anchor jumps rather than tracking their full distance.
    if (!kind && jump) {
      heading = dir;
      edge = y;
      return settle(ahead);
    }
    // Require TURN px before reversing direction, except when recovering from a nudge.
    const turned = dir !== heading && (!heading || Math.abs(y - edge) >= TURN);
    const short = !kind && dir === heading && (dir > 0) !== away;
    if (kind === "settle" || turned || short) {
      edge = y;
      return track(dir);
    }
    if (kind !== "ramp") return;
    const f = now();
    if (heading > 0 ? f >= gone : f <= shown) commit(heading > 0 ? 1 : 0);
  };
  // Timeline fractions become stale when the page or viewport resizes.
  const refit = () => {
    if (kind !== "ramp" || (Math.abs(limit() - end) < 1 && bar.offsetHeight === h)) return;
    settle(heading > 0 ? 1 : 0);
  };
  const down = () => {
    touching = true;
  };
  const up = (e: TouchEvent) => {
    touching = e.touches.length > 0;
    if (touching) return;
    window.clearTimeout(quiet);
    quiet = window.setTimeout(rested, QUIET);
  };

  const ro = new ResizeObserver(refit);
  ro.observe(document.body);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", refit);
  window.addEventListener("touchstart", down, { passive: true });
  window.addEventListener("touchend", up, { passive: true });
  window.addEventListener("touchcancel", up, { passive: true });
  return () => {
    window.clearTimeout(quiet);
    ro.disconnect();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", refit);
    window.removeEventListener("touchstart", down);
    window.removeEventListener("touchend", up);
    window.removeEventListener("touchcancel", up);
    run?.cancel();
  };
};

const BOX =
  "relative isolate before:absolute before:inset-x-[4px] lg:before:inset-x-[-2px] before:top-1/2 before:-z-10 before:h-[30px] before:-translate-y-1/2 before:rounded-[2px] before:opacity-0 before:transition-opacity before:duration-250 before:ease-[ease] before:content-[''] hover:before:opacity-100 focus-visible:before:opacity-100 aria-[current=page]:before:opacity-100 motion-reduce:before:transition-none";

const TONE = {
  overlay: {
    link: "text-overlay-ink/80 hover:text-overlay-ink aria-[current=page]:text-overlay-ink before:bg-overlay-ink/20 [text-shadow:0_1px_2px_rgb(10_9_7/0.5),0_2px_14px_rgb(10_9_7/0.6)]",
    mark: "text-overlay-ink",
    sheet: "bg-canvas-inverse",
    bar: "max-md:bg-canvas-inverse",
    rule: "border-overlay-ink/15",
    sheetLink: "text-overlay-ink",
  },
  solid: {
    link:
      "text-ink-muted hover:text-ink aria-[current=page]:text-ink before:bg-ink/[0.07]",
    mark: "text-ink",
    sheet: "bg-canvas",
    bar: "max-md:bg-canvas",
    rule: "border-rule",
    sheetLink: "text-ink",
  },
} as const;

export default function Navbar({
  tone = "solid",
}: {
  tone?: keyof typeof TONE;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const [onDark, setOnDark] = useState(tone === "overlay");
  const t = TONE[onDark ? "overlay" : "solid"];

  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
    setOnDark(tone === "overlay");
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!open || !meta || !bar.current) return;
    const was = meta.content;
    meta.content = getComputedStyle(bar.current).backgroundColor;
    return () => {
      meta.content = was;
    };
  }, [open, onDark]);

  // Keep the mobile navbar fixed; reset scroll hiding on route/menu changes.
  useEffect(() => {
    const el = bar.current;
    if (!el || open) return;
    const mobile = window.matchMedia("(max-width: 47.999rem)");
    const desk = window.matchMedia("(min-width: 64rem) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const Scroll = (window as unknown as { ScrollTimeline?: Timeline }).ScrollTimeline;
    let stop = () => {};
    const start = () => {
      stop();
      delete el.dataset.away;
      if (mobile.matches) {
        stop = () => {};
        return;
      }
      stop =
        desk.matches || still.matches || !Scroll
          ? flip(el, desk.matches ? TOP : el.offsetHeight)
          : follow(el, Scroll);
    };
    start();
    mobile.addEventListener("change", start);
    desk.addEventListener("change", start);
    still.addEventListener("change", start);
    return () => {
      mobile.removeEventListener("change", start);
      desk.removeEventListener("change", start);
      still.removeEventListener("change", start);
      stop();
      delete el.dataset.away;
    };
  }, [open, pathname]);

  useEffect(() => {
    const regions = [...document.querySelectorAll<HTMLElement>("[data-nav-dark]")];
    if (regions.length === 0) return;

    const lit = new Set<Element>();
    let io: IntersectionObserver | null = null;

    const build = () => {
      io?.disconnect();
      const bar =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--masthead"),
        ) * 16 || 64;
      lit.clear();
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) lit.add(e.target);
            else lit.delete(e.target);
          }
          setOnDark(lit.size > 0);
        },
        { rootMargin: `0px 0px -${Math.max(0, window.innerHeight - bar)}px 0px` },
      );
      for (const el of regions) io.observe(el);
    };

    build();
    window.addEventListener("resize", build);
    return () => {
      window.removeEventListener("resize", build);
      io?.disconnect();
    };
  }, [pathname]);

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        ref={bar}
        className={`navbar-chrome fixed inset-x-0 top-0 z-40 w-full transition-transform duration-300 ease-out max-lg:duration-[420ms] max-lg:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
          open ? t.bar : "mix-blend-difference"
        }`}
      >

        <div className="u-gutter relative mx-auto flex h-14 max-w-wide items-center justify-between gap-lg md:h-16">
          <Link
            href="/"
            className={`-mx-sm -my-sm flex shrink-0 items-center gap-sm px-sm py-sm ${open ? t.mark : "text-white"}`}
          >
            <Image
              src="/logo-mark.svg"
              alt=""
              width={22}
              height={24}
              loading="eager"
              style={{ height: "auto" }}
              className={open && !onDark ? "" : "brightness-0 invert"}
            />
            <span className="sr-only">Sigma Intelligence</span>
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-md lg:gap-lg">
              {NAV.map((item) => (
                // Inset the last label so its hover background ends at the gutter.
                <li key={item.href} className="md:last:pr-[4px] lg:last:pr-[calc(var(--spacing-xs)+2px)]">
                  <Link
                    href={item.href}
                    aria-current={isCurrent(item.href) ? "page" : undefined}
                    className={`${BOX} -mx-xs flex items-center px-xs py-md font-[family-name:var(--f-display)] text-ui font-semibold uppercase tracking-[0.02em] [font-stretch:125%] transition-colors duration-250 motion-reduce:transition-none ${INVERT}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="masthead-nav"
              className={`-mr-2 flex size-11 items-center justify-center ${open ? t.mark : "text-white"}`}
            >
              <span className="sr-only">
                Menu
              </span>
              <span aria-hidden="true" className="relative block h-[7px] w-5">
                <span
                  className={`absolute left-0 top-0 h-px w-5 bg-current transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    open ? "translate-y-[3px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-px w-5 bg-current transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    open ? "-translate-y-[3px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {open ? (
          <div
            aria-hidden="true"
            data-backdrop
            onClick={() => setOpen(false)}
            className="absolute inset-x-0 top-full h-[100dvh] bg-ink/25 transition-opacity duration-300 starting:opacity-0 motion-reduce:transition-none md:hidden"
          />
        ) : null}

        <nav
          id="masthead-nav"
          aria-label="Primary"
          hidden={!open}
          className={`nav-sheet absolute inset-x-0 top-full max-h-[calc(100dvh-var(--masthead))] overflow-y-auto overscroll-contain rounded-b-[1.5rem] [clip-path:inset(0_-4rem_-4rem_-4rem)] shadow-[0_18px_40px_rgb(10_9_7/0.14)] [corner-shape:squircle] md:hidden ${
            open ? "nav-open" : ""
          } ${t.sheet}`}
        >
          <ul className="u-gutter u-arrive mx-auto max-w-wide pb-sm">
            {NAV.map((item) => (
              <li key={item.href} className={`border-b last:border-b-0 ${t.rule}`}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-14 items-center [@media(max-height:30rem)]:min-h-11 font-[family-name:var(--f-display)] text-title font-semibold uppercase tracking-[0.02em] [font-stretch:125%] ${t.sheetLink}`}
                >
                  <span>
                    {item.label}
                    {isCurrent(item.href) ? (
                      <span aria-hidden="true" className="ml-sm inline-block size-[0.3em] bg-accent align-[calc((1cap-0.3em)/2)]" />
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}

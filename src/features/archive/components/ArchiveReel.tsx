"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { T } from "@/components/T";
import { useWide } from "@/lib/media";
import type { Bilingual, Photo } from "../types";
import { PLATE, type Tile } from "../data/field";
import EntryBody from "./EntryBody";
import PlateArt from "./PlateArt";
import { archiveGo } from "./ArchiveTransitions";

/**
 * The reel — one build at a time, large, inside registration marks, with its neighbours
 * shrinking away above and below (after Obys's work strip). The rail keeps every name in view;
 * the panel beside it *is* the entry — year, result, story, team, tags and the photographs.
 * The entries were their own pages once; they run a few hundred words each, which is short
 * enough to read here, so the reel holds all of it and nothing is a click away. The page
 * scrolls through it: each build is a step of scroll, the view stays pinned, and it settles on
 * the nearest build. The address follows (`?view=reel&at=<id>`), so a build can be linked and
 * Back returns to it.
 */
export interface ReelBuild {
  id: string;
  name: Bilingual;
  year: string;
  /** The era, when it says more than the year does. */
  era: string | null;
  award?: Bilingual;
  tags: Bilingual[];
  /** The entry itself, for a build that has one written. */
  body?: string;
  team?: string[];
  photos?: Photo[];
  videos?: string[];
  tile: Tile;
}

export interface ReelGroup {
  label: string | null;
  from: number;
  to: number;
}

const META = "text-caption tracking-normal leading-[1.35]";
/**
 * Scroll, in px, from one build to the next. Two settling schemes have been tried and both were
 * wrong: an immediate JS `scrollTo` snap-back fought a trackpad's inertia, and scroll-snap points every
 * `STEP` px made the reel a trap — a wheel notch is around 100px, never half a step, so
 * proximity snapping returned the page to the build it started on and no amount of gentle
 * scrolling upward moved it at all (measured: `scrollY` pinned at 615 through twenty notches,
 * then thrown to 0 by one hard flick). The reel now leaves native scrolling untouched until its
 * momentum ends, then an interruptible spring draws the nearest intended build into place.
 */
const STEP = 160;
/**
 * How far a push has to move, as a fraction of a build, before it counts as meant. Under this
 * the reel returns to the build it started on, so a twitch of the wheel does not advance it.
 */
const DEADZONE = 0.15;
/** How much larger the build in front is than its neighbours. */
const BIG = 2.8;
const MARK = 10;

const reelHref = (query: string, id: string) =>
  `/archive?${query ? `${query}&` : ""}view=reel&at=${id}`;

const FRAME =
  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-300 ease-magnify motion-reduce:transition-none";

// Registration marks; on a linked frame they open outward when it's pointed at or focused.
const CORNER =
  "absolute size-[10px] border-ink transition-[translate] duration-300 ease-magnify motion-reduce:transition-none";
function Corners() {
  return (
    <>
      <i className={`${CORNER} top-0 left-0 border-t-[1.5px] border-l-[1.5px] group-hover/open:-translate-2 group-focus-visible/open:-translate-2`} />
      <i className={`${CORNER} top-0 right-0 border-t-[1.5px] border-r-[1.5px] group-hover/open:translate-x-2 group-hover/open:-translate-y-2 group-focus-visible/open:translate-x-2 group-focus-visible/open:-translate-y-2`} />
      <i className={`${CORNER} bottom-0 left-0 border-b-[1.5px] border-l-[1.5px] group-hover/open:-translate-x-2 group-hover/open:translate-y-2 group-focus-visible/open:-translate-x-2 group-focus-visible/open:translate-y-2`} />
      <i className={`${CORNER} right-0 bottom-0 border-r-[1.5px] border-b-[1.5px] group-hover/open:translate-2 group-focus-visible/open:translate-2`} />
    </>
  );
}

const squareOf = (tile: Tile) => PLATE[tile.shape].w / PLATE.sq.w;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function ArchiveReel({
  builds,
  groups,
  start,
  jump,
  query,
  back,
}: {
  builds: ReelBuild[];
  groups: ReelGroup[];
  /** The build to open at. */
  start: number;
  /** Scroll straight to it — the address named a build. */
  jump: boolean;
  /** The rest of the address (era, sort, look), to build reel links from. */
  query: string;
  /** Where Escape goes: the depth field at the same era, sort and look. */
  back: string;
}) {
  const router = useRouter();
  const [active, setActive] = useState(start);
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const marksRef = useRef<HTMLAnchorElement & HTMLDivElement>(null);
  const count = builds.length;
  // inert below md: a hidden section measures as zeros
  const wide = useWide();

  // Escape leads back to the field; have it ready before it is asked for.
  useEffect(() => {
    if (!wide) return;
    const id = window.setTimeout(() => router.prefetch(back), 600);
    return () => window.clearTimeout(id);
  }, [wide, back, router]);

  useEffect(() => {
    const section = sectionRef.current;
    const strip = stripRef.current;
    if (!wide || !section || !strip || !section.offsetParent) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shapes = builds.map((b) => ({ w: PLATE[b.tile.shape].w, h: PLATE[b.tile.shape].h }));
    let unit = 0;
    let cur = start;
    let shown = start;
    let raf = 0;
    // Once the reader leaves — Back, or a link — the reel stays on screen for a moment while
    // the next page arrives and its scroll is restored; it must not answer that scroll.
    let leaving = false;
    const here = () => {
      if (leaving || window.location.pathname !== "/archive") return false;
      const view = new URLSearchParams(window.location.search).get("view");
      return view === null || view === "reel";
    };

    const top = () => section.getBoundingClientRect().top + window.scrollY;
    const target = () => clamp((window.scrollY - top()) / STEP, 0, count - 1);
    const within = () => {
      const t = (window.scrollY - top()) / STEP;
      return t > -0.5 && t < count - 0.5;
    };

    const size = () => {
      unit = Math.min(strip.clientWidth * 0.62, strip.clientHeight * 0.5);
      strip.style.setProperty("--u", `${unit}px`);
    };

    const place = (at: number) => {
      const small = (unit / BIG) * 1.08;
      const pitch = small + 14;
      const reach = unit / 2 - small / 2 + 30;
      plateRefs.current.forEach((el, i) => {
        if (!el) return;
        const k = i - at;
        const ak = Math.abs(k);
        if (ak > 7) {
          el.style.visibility = "hidden";
          return;
        }
        const s = 1 / BIG + (1 - 1 / BIG) * Math.max(0, 1 - ak);
        const y = k * pitch + Math.sign(k) * Math.min(ak, 1) * reach;
        el.style.visibility = "visible";
        el.style.opacity = String(Math.max(0, 1 - ak / 7));
        el.style.transform = `translate(-50%, -50%) translateY(${y.toFixed(1)}px) scale(${s.toFixed(4)})`;
      });
      const marks = marksRef.current;
      const near = shapes[Math.round(at)];
      if (marks && near) {
        const f = unit / PLATE.sq.w;
        marks.style.width = `${near.w * f + 2 * MARK + 8}px`;
        marks.style.height = `${near.h * f + 2 * MARK + 8}px`;
      }
    };

    const syncAddress = (i: number) => {
      if (!here()) return;
      const url = reelHref(query, builds[i].id);
      window.history.replaceState(window.history.state, "", url);
    };

    const frame = () => {
      raf = 0;
      const t = target();
      cur = still.matches ? t : cur + (t - cur) * 0.22;
      if (Math.abs(t - cur) < 0.001) cur = t;
      place(cur);
      const i = Math.round(t);
      if (i !== shown) {
        shown = i;
        setActive(i);
        if (within()) syncAddress(i);
      }
      if (cur !== t) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const goTo = (i: number, smooth = true) => {
      from = clamp(i, 0, count - 1);
      window.scrollTo({
        top: top() + clamp(i, 0, count - 1) * STEP,
        behavior: smooth && !still.matches ? "smooth" : "instant",
      });
    };

    // The reel settles on a build once the reader has actually stopped, never while they are
    // still moving. Scroll-snap points did the settling in the browser and made the reel a trap
    // — a wheel notch is around 100px and never half a step, so proximity snapping returned the
    // page to the build it started from and no amount of gentle scrolling upward moved it. This
    // waits for the scroll to end, then draws the nearest build in.
    const hasScrollEnd = "onscrollend" in window;
    let settle = 0;
    let held = false;
    // The build the reel last came to rest on. Read from here, not from the scroll position at
    // the first scroll event: that event arrives *after* the wheel has already moved the page,
    // so the reading was a notch stale and every push upward was scored as a push downward and
    // sent back where it came from.
    let from = start;
    let settling = false;
    /**
     * Where a push should land. Snapping to the *nearest* build pulls a reader who nudged the
     * page forward back to the one they started on — GSAP's ScrollTrigger has defaulted its snap
     * to `directional: true` since 3.8.0 for exactly that reason. So a push that clears the
     * deadzone always lands on the next build along, whichever way it went, and only a push that
     * barely moved returns to where it came from.
     */
    const landing = (t: number) => {
      const d = t - from;
      if (Math.abs(d) < DEADZONE) return from;
      return d > 0 ? Math.max(from + 1, Math.round(t)) : Math.min(from - 1, Math.round(t));
    };
    /** The pull itself. Native momentum runs first; this interruptible, critically damped spring
     * takes over only after rest, matching the history dial without stacking a browser smooth
     * scroll beneath it. */
    let pull = 0;
    const glide = (to: number) => {
      cancelAnimationFrame(pull);
      settling = false;
      if (still.matches) {
        window.scrollTo({ top: to, behavior: "instant" });
        return;
      }
      // The start is read in the first frame, not here: called at the end of a gesture the page
      // is often still drifting a pixel or two, and a guard measured from the call site saw that
      // drift as the reader taking over and let go of the pull before it began.
      let y0 = NaN;
      let then = 0;
      let last = NaN;
      let velocity = 0;
      const frame = (now: number) => {
        if (Number.isNaN(y0)) {
          y0 = window.scrollY;
          if (Math.abs(to - y0) < 1) return;
          then = now;
        } else if (Math.abs(window.scrollY - last) > 2) {
          // The reader interrupting outranks the pull.
          settling = false;
          return;
        }
        const dt = Math.min(0.032, Math.max(0.008, (now - then) / 1000));
        then = now;
        const y = window.scrollY;
        const acceleration = (to - y) * 250 - velocity * 32;
        velocity += acceleration * dt;
        const next = y + velocity * dt;
        settling = true;
        // `instant`, explicitly: the document carries `scroll-behavior: smooth` for the era
        // anchors, so a bare `scrollTo` would hand each frame of this tween to the browser to
        // animate again — the page then lagged the tween by more than the interrupt guard
        // allows and the pull let go of itself a third of the way in.
        if (Math.abs(to - next) < 0.35 && Math.abs(velocity) < 5) {
          last = to;
          window.scrollTo({ top: to, behavior: "instant" });
          settling = false;
          return;
        }
        last = next;
        window.scrollTo({ top: next, behavior: "instant" });
        pull = requestAnimationFrame(frame);
      };
      pull = requestAnimationFrame(frame);
    };

    const rest = () => {
      settle = 0;
      if (held || !here()) return;
      if (!within()) {
        // Left the reel: the next push starts from whichever end it went out of.
        from = clamp(Math.round(target()), 0, count - 1);
        return;
      }
      const i = clamp(landing(target()), 0, count - 1);
      from = i;
      glide(top() + i * STEP);
    };
    const soon = () => {
      if (settling) return;
      window.clearTimeout(settle);
      // A debounce on the scroll itself already waits out a trackpad's momentum, because
      // momentum keeps producing scroll events — so it can be short. `scrollend` is kept as a
      // second trigger, but it is the slower of the two: it waits for the browser's own
      // end-of-scroll detection on top of the gesture.
      settle = window.setTimeout(rest, 70);
    };
    // A finger still on the screen outranks the magnet; the wheel needs no such guard, since
    // every notch restarts the wait.
    const grab = () => {
      held = true;
      window.clearTimeout(settle);
      cancelAnimationFrame(pull);
      settling = false;
      settle = 0;
    };
    const free = () => {
      held = false;
      soon();
    };

    // Until the reel pins, part of its screen is still below the fold; the frame is fitted to
    // what shows, so the first view is composed rather than centred on a half-hidden box.
    const lift = () => {
      const l = Math.max(0, Math.round(section.getBoundingClientRect().top));
      section.style.setProperty("--lift", `${l}px`);
    };
    const onScroll = () => {
      lift();
      kick();
      soon();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || !within()) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        goTo(Math.round(target()) + (e.key === "ArrowDown" ? 1 : -1));
      } else if (e.key === "Escape") {
        // Handled here so the room's Escape (back to the door) doesn't fire.
        e.preventDefault();
        leaving = true;
        if (!archiveGo(back)) router.push(back);
      }
    };

    // A name in the rail, or a neighbour in the strip, brings that build to the front.
    const onPick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const a = el.closest?.<HTMLAnchorElement>("a[data-at]");
      if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        goTo(Number(a.dataset.at));
        return;
      }
      const plate = el.closest?.<HTMLElement>("[data-plate]");
      if (plate) goTo(Number(plate.dataset.plate));
    };

    const onResize = () => {
      size();
      place(cur);
    };
    const onLeave = () => {
      leaving = true;
    };

    lift();
    size();
    place(start);
    // Open at the requested build once Next has done its own arrival scroll.
    const open = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (jump) goTo(start, false);
        kick();
      }),
    );

    const ro = new ResizeObserver(onResize);
    ro.observe(strip);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (hasScrollEnd) window.addEventListener("scrollend", soon);
    window.addEventListener("pointerdown", grab, { passive: true });
    window.addEventListener("pointerup", free, { passive: true });
    window.addEventListener("pointercancel", free, { passive: true });
    window.addEventListener("keydown", onKey);
    section.addEventListener("click", onPick);
    window.addEventListener("popstate", onLeave);

    return () => {
      cancelAnimationFrame(open);
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.clearTimeout(settle);
      cancelAnimationFrame(pull);
      window.removeEventListener("scroll", onScroll);
      if (hasScrollEnd) window.removeEventListener("scrollend", soon);
      window.removeEventListener("pointerdown", grab);
      window.removeEventListener("pointerup", free);
      window.removeEventListener("pointercancel", free);
      window.removeEventListener("keydown", onKey);
      section.removeEventListener("click", onPick);
      window.removeEventListener("popstate", onLeave);
    };
  }, [builds, count, start, jump, query, back, router, wide]);

  // Keep the active name in the middle of the rail.
  useEffect(() => {
    const rail = railRef.current;
    const row = rail?.querySelector<HTMLElement>(`[data-row="${active}"]`);
    if (!rail || !row) return;
    const fit = () => {
      const box = rail.parentElement!.clientHeight;
      const pad = 24;
      const mid = box / 2 - row.offsetTop - row.offsetHeight / 2;
      const y = Math.min(pad, Math.max(box - rail.offsetHeight - pad, mid));
      rail.style.translate = `0 ${Math.round(y)}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(rail.parentElement!);
    return () => ro.disconnect();
  }, [active]);

  const b = builds[active];

  return (
    <section
      ref={sectionRef}
      data-reel
      style={{ height: `calc(${(count - 1) * STEP}px + 100svh)` }}
      className="relative"
    >
      <div className="sticky top-0 h-svh overflow-hidden pt-[max(1.5rem,calc(var(--masthead)+1.5rem-var(--lift,0px)))] pb-lg">
        <div className="u-gutter mx-auto grid h-[calc(100%-var(--lift,0px))] grid-rows-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,2.25fr)_minmax(0,5.25fr)_minmax(0,4.5fr)] md:grid-rows-1 md:gap-x-[clamp(1.5rem,2.5vw,3rem)]">
          {/* Rail */}
          <nav
            aria-label="Builds"
            className="relative hidden overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_1.5rem,black_calc(100%-4rem),transparent)] md:block"
          >
            <ol
              ref={railRef}
              className="absolute inset-x-0 top-0 transition-[translate] duration-500 ease-magnify motion-reduce:transition-none"
            >
              {groups.map((g) => (
                <li key={`${g.label}-${g.from}`}>
                  {g.label ? (
                    <p className={`mt-lg mb-xs text-ink-subtle tabular-nums [li:first-child>&]:mt-0 ${META}`}>{g.label}</p>
                  ) : null}
                  <ol>
                    {builds.slice(g.from, g.to).map((x, n) => {
                      const i = g.from + n;
                      const on = i === active;
                      return (
                        <li key={x.id} data-row={i}>
                          <a
                            href={reelHref(query, x.id)}
                            data-at={i}
                            aria-current={on ? "true" : undefined}
                            className={`u-line-cap group/row flex items-baseline justify-between gap-x-sm py-[4px] text-body-sm transition-colors duration-300 ${
                              on ? "text-ink" : "text-ink-subtle hover:text-ink"
                            }`}
                          >
                            <span className="flex min-w-0 items-baseline gap-x-xs">
                              <span
                                aria-hidden="true"
                                className={`size-[5px] shrink-0 -translate-y-[0.1em] self-center bg-ink transition-[opacity,scale] duration-300 ${on ? "opacity-100" : "scale-0 opacity-0"}`}
                              />
                              <span className="truncate">
                                <T en={x.name.en} ko={x.name.ko} />
                              </span>
                            </span>
                            {g.label ? null : (
                              <span className={`u-cap-centre shrink-0 tabular-nums ${META}`}>{x.year}</span>
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </li>
              ))}
            </ol>
          </nav>

          {/* Strip */}
          <div
            ref={stripRef}
            className="relative min-h-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
          >
            {builds.map((x, i) => (
              <div
                key={x.id}
                aria-hidden="true"
                data-plate={i}
                data-plate-id={x.id}
                ref={(el) => {
                  plateRefs.current[i] = el;
                }}
                style={
                  {
                    width: `calc(var(--u, 16rem) * ${squareOf(x.tile)})`,
                    visibility: Math.abs(i - start) > 7 ? "hidden" : undefined,
                    transform: i === start ? "translate(-50%, -50%)" : undefined,
                    opacity: i === start ? undefined : 0,
                  } as CSSProperties
                }
                className="absolute top-1/2 left-1/2 cursor-pointer will-change-transform"
              >
                <PlateArt
                  tile={x.tile}
                  sizes="(min-width: 1024px) 26vw, 60vw"
                  eager={i === start}
                  className="w-full overflow-hidden u-corner"
                />
              </div>
            ))}
            {/* The marks frame the build in front. */}
            <div ref={marksRef} aria-hidden="true" className={`${FRAME} pointer-events-none`}>
              <Corners />
            </div>
          </div>

          {/* The entry. It scrolls in its own column; the reel keeps the window's scroll. */}
          <div className="flex min-h-0 flex-col pt-md pb-lg md:py-0">
            <div
              key={b.id}
              aria-live="polite"
              // The entry scrolls, but without a bar: the reel is a pinned screen and the site's
              // own scrollbar is drawn 11px wide, which put a second rail down the middle of the
              // page beside the window's. On a phone the panel is the shorter half of the
              // screen, so its scroll is faded out at the foot rather than cut through a line.
              className="min-h-0 max-h-[38svh] flex-1 overflow-y-auto pt-lg pb-section transition-opacity duration-300 [mask-image:linear-gradient(to_bottom,transparent,#000_var(--spacing-lg),#000_calc(100%-4rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden starting:opacity-0 md:max-h-none"
            >
              <EntryBody build={b} variant="panel" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useWide } from "@/lib/media";
import type { Photo } from "../types";
import { PLATE, type Tile } from "../data/field";
import EntryBody from "./EntryBody";
import PlateArt from "./PlateArt";
import { archiveGo } from "./ArchiveTransitions";

export interface ReelBuild {
  id: string;
  name: string;
  year: string;
  era: string | null;
  award?: string;
  tags: string[];
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
const STEP = 160;
const DEADZONE = 0.15;
const BIG = 2.8;
const MARK = 10;

const reelHref = (query: string, id: string) =>
  `/archive?${query ? `${query}&` : ""}view=reel&at=${id}`;

const FRAME =
  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-300 ease-magnify motion-reduce:transition-none";

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
  start: number;
  jump: boolean;
  query: string;
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
  const wide = useWide();

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

    const hasScrollEnd = "onscrollend" in window;
    let settle = 0;
    let held = false;
    let from = start;
    let settling = false;
    const landing = (t: number) => {
      const d = t - from;
      if (Math.abs(d) < DEADZONE) return from;
      return d > 0 ? Math.max(from + 1, Math.round(t)) : Math.min(from - 1, Math.round(t));
    };
    let pull = 0;
    const glide = (to: number) => {
      cancelAnimationFrame(pull);
      settling = false;
      if (still.matches) {
        window.scrollTo({ top: to, behavior: "instant" });
        return;
      }
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
      settle = window.setTimeout(rest, 70);
    };
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
        e.preventDefault();
        leaving = true;
        if (!archiveGo(back)) router.push(back);
      }
    };

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
                    <p className={`mt-lg mb-xs text-ink-muted tabular-nums [li:first-child>&]:mt-0 ${META}`}>{g.label}</p>
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
                              on ? "text-ink" : "text-ink-muted hover:text-ink"
                            }`}
                          >
                            <span className="flex min-w-0 items-baseline gap-x-xs">
                              <span
                                aria-hidden="true"
                                className={`relative -top-[calc((1cap-5px)/2)] size-[5px] shrink-0 bg-ink transition-[opacity,scale] duration-300 ${on ? "opacity-100" : "scale-0 opacity-0"}`}
                              />
                              <span className="truncate">
                                {x.name}
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
            <div ref={marksRef} aria-hidden="true" className={`${FRAME} pointer-events-none`}>
              <Corners />
            </div>
          </div>

          <div className="flex min-h-0 flex-col pt-md pb-lg md:py-0">
            <div
              key={b.id}
              aria-live="polite"
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

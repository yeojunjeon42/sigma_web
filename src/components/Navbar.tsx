"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { EMAIL } from "@/features/site/data/contact";
import { SOCIAL } from "@/features/site/data/social";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Archive", href: "/archive" },
  { label: "History", href: "/history" },
  { label: "Members", href: "/members" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const BLUR: React.CSSProperties = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  maskImage: "linear-gradient(rgb(0,0,0), rgba(0,0,0,0) 100%)",
  WebkitMaskImage: "linear-gradient(rgb(0,0,0), rgba(0,0,0,0) 100%)",
};

const SCRIM_STYLE = (onDark: boolean): React.CSSProperties => ({
  ...BLUR,
  backgroundImage: onDark
    ? "linear-gradient(to bottom, rgb(10 9 7 / 0.22), rgb(10 9 7 / 0.06) 60%, rgb(10 9 7 / 0))"
    : "linear-gradient(to bottom, rgb(255 255 255 / 0.55), rgb(255 255 255 / 0.2) 60%, rgb(255 255 255 / 0))",
});

const BOX =
  "relative isolate before:absolute before:inset-x-[4px] lg:before:inset-x-[-2px] before:top-1/2 before:-z-10 before:h-[30px] before:-translate-y-1/2 before:rounded-[2px] before:opacity-0 before:transition-opacity before:duration-250 before:ease-[ease] before:content-[''] hover:before:opacity-100 focus-visible:before:opacity-100 aria-[current=page]:before:opacity-100 motion-reduce:before:transition-none";

const TONE = {
  overlay: {
    link: "text-overlay-ink/80 hover:text-overlay-ink aria-[current=page]:text-overlay-ink before:bg-overlay-ink/20 [text-shadow:0_1px_2px_rgb(10_9_7/0.5),0_2px_14px_rgb(10_9_7/0.6)]",
    mark: "text-overlay-ink",
    sheet: "bg-canvas-inverse",
    bar: "max-md:bg-canvas-inverse",
    rule: "border-overlay-ink/15",
    sheetLink: "text-overlay-ink/60 aria-[current=page]:text-overlay-ink",
    sheetFoot: "text-overlay-ink/70",
  },
  solid: {
    link:
      "text-ink-muted hover:text-ink aria-[current=page]:text-ink before:bg-ink/[0.07]",
    mark: "text-ink",
    sheet: "bg-canvas",
    bar: "max-md:bg-canvas",
    rule: "border-rule",
    sheetLink: "text-ink-muted aria-[current=page]:text-ink",
    sheetFoot: "text-ink-muted",
  },
} as const;

export default function Navbar({
  tone = "solid",
}: {
  tone?: keyof typeof TONE;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
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
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 96);
        last = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className={`fixed inset-x-0 top-0 z-40 w-full transition-transform duration-300 ease-out motion-reduce:transition-none ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      } ${open ? t.bar : ""}`}
    >
      <div
        aria-hidden="true"
        style={SCRIM_STYLE(onDark)}
        className={`pointer-events-none absolute inset-x-0 top-0 h-[var(--masthead)] transition-opacity duration-300 motion-reduce:transition-none ${
          hidden && !open ? "opacity-0" : "opacity-100"
        }`}
      />

      <div className="u-gutter relative mx-auto flex h-14 max-w-wide items-center justify-between gap-lg md:h-16">
        <Link
          href="/"
          className={`-mx-sm -my-sm flex shrink-0 items-center gap-sm px-sm py-sm ${t.mark}`}
        >
          <Image
            src="/logo-mark.svg"
            alt=""
            width={22}
            height={24}
            style={{ height: "auto" }}
            className={onDark ? "brightness-0 invert" : ""}
          />
          <span className="sr-only">Sigma Intelligence</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-md lg:gap-lg">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className={`${BOX} -mx-xs flex items-center px-xs py-md text-ui uppercase tracking-[0.04em] transition-colors duration-250 motion-reduce:transition-none ${t.link}`}
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
            className={`-mr-2 flex size-11 items-center justify-center ${t.mark}`}
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

      <nav
        id="masthead-nav"
        aria-label="Primary"
        hidden={!open}
        className={`nav-sheet absolute inset-x-0 top-full h-[calc(100dvh-var(--masthead))] overflow-y-auto overscroll-contain border-t border-transparent md:hidden ${
          open ? "nav-open" : ""
        } ${t.sheet}`}
      >
        <div className="u-gutter mx-auto flex min-h-full max-w-wide flex-col pb-[max(var(--spacing-lg),env(safe-area-inset-bottom))] pt-sm">
          <ul className={`u-arrive border-t ${t.rule}`}>
            {NAV.map((item) => (
              <li key={item.href} className={`border-b ${t.rule}`}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-16 items-center text-display-lg ${t.sheetLink}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className={`mt-auto grid gap-y-md pt-xxl text-body ${t.sheetFoot}`}>
            <a href={`mailto:${EMAIL}`} className="-my-sm flex min-h-11 items-center">
              {EMAIL}
            </a>
            <ul className="flex flex-wrap gap-x-lg">
              {SOCIAL.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="-my-sm flex min-h-11 items-center">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

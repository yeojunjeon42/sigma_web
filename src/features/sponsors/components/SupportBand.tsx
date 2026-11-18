"use client";

import Image from "next/image";
import { useRef } from "react";
import { Container } from "@/components/ui";
import type { Sponsor } from "../api/getSponsors";

// The colours fade in over the ink, and the ink goes only once they are fully there (and is back
// at once when they start to leave). Fading both at the same time dims the logo half way: a flicker.
const COLOUR = "transition-opacity duration-200 motion-reduce:transition-none";
const INK = "[transition:opacity_0s_linear_0s] group-hover/logo:[transition-delay:200ms] group-focus-visible/logo:[transition-delay:200ms]";

// From the desk the supporters are one small row, centred under the hero; below it they roll
// inside the hero (HeroField). Every logo's letters stand one height on one baseline. At rest a
// logo is a mask over the text colour, so all print in the one ink; pointing at one shows its own
// colours.
export default function SupportBand({ sponsors, cofounded }: { sponsors: Sponsor[]; cofounded: Sponsor[] }) {
  const chip = useRef<HTMLSpanElement>(null);
  // The chip rides the pointer, a little below and to its right. Its place is written straight to
  // the element: it moves with every pointer event, which is no business of a render.
  const show = (tie: string, x: number, y: number) => {
    const c = chip.current;
    if (!c) return;
    c.textContent = tie;
    c.style.translate = `${Math.round(x)}px ${Math.round(y)}px`;
    c.toggleAttribute("data-show", true);
  };
  const hide = () => chip.current?.removeAttribute("data-show");

  // What each one is to the club, shown in the chip while its logo is pointed at.
  const items = [
    ...sponsors.map((s) => ({ ...s, tie: "Sponsor" })),
    ...cofounded.map((s) => ({ ...s, tie: "Co-founded" })),
  ];
  if (items.length === 0) return null;
  return (
    <section aria-label="Supported by" className="hidden py-xxl desk:block">
      <Container>
        <ul data-offgrid className="flex items-baseline justify-center gap-x-xxxl [--logo-cap:clamp(1rem,1.2vw,1.5rem)]">
          {items.map((s) => (
            <li key={s.id}>
              <a
                href={s.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.name}, ${s.tie}`}
                onPointerMove={(e) => {
                  if (e.pointerType === "mouse") show(s.tie, e.clientX + 14, e.clientY + 18);
                }}
                onPointerLeave={hide}
                onFocus={(e) => {
                  // The keyboard has no pointer to ride, so the chip hangs under the logo.
                  if (!e.currentTarget.matches(":focus-visible")) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  show(s.tie, r.left, r.bottom + 8);
                }}
                onBlur={hide}
                className="group/logo block text-ink"
              >
                <span
                  aria-hidden="true"
                  style={{
                    height: `calc(var(--logo-cap) / ${s.logo.cap})`,
                    aspectRatio: `${s.logo.width} / ${s.logo.height}`,
                    marginBottom: `calc(var(--logo-cap) / ${s.logo.cap} * ${-s.logo.foot})`,
                  }}
                  className="relative block"
                >
                  <span
                    style={{ maskImage: `url(${s.logo.src})`, WebkitMaskImage: `url(${s.logo.src})` }}
                    className={`absolute inset-0 bg-current [mask-repeat:no-repeat] [mask-size:100%_100%] group-hover/logo:opacity-0 group-focus-visible/logo:opacity-0 ${INK}`}
                  />
                  <Image
                    src={s.logo.src}
                    alt=""
                    width={s.logo.width}
                    height={s.logo.height}
                    loading="eager"
                    className={`absolute inset-0 size-full opacity-0 group-hover/logo:opacity-100 group-focus-visible/logo:opacity-100 ${COLOUR}`}
                  />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
      <span
        ref={chip}
        aria-hidden="true"
        data-overlay
        className={`pointer-events-none fixed top-0 left-0 z-30 bg-canvas-inverse px-xs py-1.5 text-caption leading-none whitespace-nowrap text-ink-inverse opacity-0 data-[show]:opacity-100 ${COLOUR}`}
      />
    </section>
  );
}

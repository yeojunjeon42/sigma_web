import Image from "next/image";
import HeroPlate, { HeroCaption, type HeroBuild } from "./HeroPlate";
import type { Sponsor } from "@/features/sponsors/api/getSponsors";
import { PLATE_KEY } from "@/lib/halftone";

const FRAME = {
  "--S": "calc((100vw - 2 * var(--gutter)) / 9.155)",
  // Seven columns (line 6 to the right margin) over INTELLIGENCE's measured ink width in em.
  "--Swide": "calc((100vw * 7 / 12 - var(--gutter) * 19 / 12) / 9.155)",
} as React.CSSProperties;

const BIG =
  "u-trim u-lift font-[family-name:var(--f-display)] text-[length:var(--S)] leading-[0.9] font-bold tracking-[-0.02em] text-ink uppercase [font-stretch:125%] desk:text-[length:var(--Swide)]";

const STMT_SIZE = "text-[length:clamp(1.125rem,2.4vw,1.5rem)] max-[359px]:text-[1rem] desk:text-[length:clamp(0.9375rem,1.7vw,2rem)]";

const STMT = `${STMT_SIZE} u-lift max-w-[19ch] leading-[1.25] tracking-[-0.01em] text-balance text-ink [word-break:keep-all] desk:leading-[1.1] desk:tracking-[-0.02em] desk:[text-wrap:wrap]`;

const META = "text-ui tracking-normal";

const at = (ms: number) => ({ "--at": `${ms}ms` }) as React.CSSProperties;

function Stmt({ className, delay, children }: { className: string; delay: number; children: React.ReactNode }) {
  return (
    <p style={at(delay)} className={`${STMT} hero-set ${className}`}>
      {children}
    </p>
  );
}

function Letters({ children }: { children: string }) {
  return [...children].map((c, i) => (
    <span key={i} style={{ "--i": i } as React.CSSProperties}>
      {c}
    </span>
  ));
}

// Half the track must outrun the widest column it rolls in, and the row translates by half.
const ROLL_COPIES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function LogoRoll({ items }: { items: Sponsor[] }) {
  const set = (copy: boolean) =>
    items.map((s) => (
      <li key={s.id} className="shrink-0 pr-xxl">
        <a
          href={s.website}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={copy ? undefined : s.name}
          tabIndex={copy ? -1 : undefined}
          className="relative block shrink-0 opacity-55 grayscale transition-[opacity,filter] duration-200 before:absolute before:top-1/2 before:left-1/2 before:h-11 before:w-[max(100%,2.75rem)] before:-translate-1/2 before:content-[''] hover:opacity-100 hover:grayscale-0 active:opacity-100 active:grayscale-0 motion-reduce:transition-none"
        >
          <Image
            src={s.logo.src}
            alt=""
            width={s.logo.width}
            height={s.logo.height}
            style={{ height: `calc(var(--logo-cap) / ${s.logo.cap})`, marginBottom: `calc(var(--logo-cap) / ${s.logo.cap} * ${-s.logo.foot})` }}
            className="block w-auto max-w-none"
          />
        </a>
      </li>
    ));

  return (
    <div data-offgrid className="-mx-[var(--gutter)] overflow-hidden py-2 [--logo-cap:1rem] motion-reduce:overflow-x-auto">
      <div className="logo-roll flex w-max">
        {ROLL_COPIES.map((n) => (
          <ul key={n} aria-hidden={n > 0 || undefined} className={`flex shrink-0 items-baseline ${n > 0 ? "motion-reduce:hidden" : ""}`}>
            {set(n > 0)}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default function HeroField({
  sponsors,
  cofounded,
  builds,
}: {
  sponsors: Sponsor[];
  cofounded: Sponsor[];
  builds: HeroBuild[];
}) {

  return (
    <section style={FRAME} className="relative isolate touch-pan-y touch-pinch-zoom overflow-hidden bg-canvas">
      <h1 className="sr-only">
        Sigma Intelligence — the robotics club of Seoul National University
      </h1>

      {builds.length > 0 && (
        // Preload the next plate using HeroPlate's persisted index.
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{const s=${JSON.stringify(builds.map((b) => b.src))};let l=Number(localStorage.getItem("${PLATE_KEY}")??-1);if(!Number.isInteger(l))l=-1;const k=document.createElement("link");k.rel="preload";k.as="image";k.fetchPriority="high";k.href=s[((l%s.length)+s.length+1)%s.length];document.head.append(k)}catch{}})()`,
          }}
        />
      )}
      <HeroPlate builds={builds} />

      <div className="u-sheet relative z-10 flex min-h-[calc(var(--screen)+var(--below))] flex-col pt-[var(--masthead)] [--below:5.5rem] desk:grid desk:min-h-[max(var(--screen),38rem)] desk:grid-rows-[auto_repeat(4,minmax(min-content,1fr))_auto] desk:pt-[calc(var(--masthead)+1.5rem)] desk:pb-lg lg:pb-16">
        <div className="flex items-start justify-between pt-md desk:contents">
          <span
            aria-hidden="true"
            style={at(60)}
            className={`${BIG} hero-letters -ml-[0.046em] desk:col-span-5 desk:col-start-1 desk:row-start-1 desk:self-start`}
          >
            <Letters>Sigma</Letters>
          </span>
          <Stmt delay={380} className="u-trim desk:col-span-3 desk:col-start-10 desk:row-start-1 desk:self-start">
            Est. 1984
          </Stmt>
        </div>

        <div className="mt-lg grid min-h-[27rem] flex-1 [contain:size] grid-cols-6 grid-rows-[auto_auto_minmax(0,1fr)_auto_auto] gap-x-gutter desk:mt-0 desk:contents">
          <div
            data-plate
            className="pointer-events-none col-span-6 col-start-1 row-start-3 -mx-lg -my-xl min-h-0 [--plate-scale:1.3] desk:absolute desk:col-auto desk:row-auto desk:top-[17%] desk:right-[26%] desk:bottom-[20%] desk:left-[22%] desk:mx-0 desk:my-0 desk:[--plate-scale:1]"
          >
            {builds[0] ? (
              <noscript>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={builds[0].src} alt={builds[0].year ? `${builds[0].name}, ${builds[0].year}` : builds[0].name} className="h-full w-full object-contain" />
              </noscript>
            ) : null}
          </div>
          <Stmt
            delay={320}
            className="col-span-3 col-start-4 row-start-1 self-start desk:col-span-4 desk:col-start-6 desk:row-start-1 desk:[text-box:trim-both_cap_alphabetic]"
          >
            Seoul National University
          </Stmt>
          <Stmt
            delay={440}
            className="hidden desk:col-span-3 desk:col-start-10 desk:row-start-2 desk:block desk:self-end"
          >
            Room 215‑2, Mabang
          </Stmt>
          <Stmt
            delay={500}
            className="col-span-4 col-start-2 row-start-2 mt-lg self-start desk:col-span-3 desk:col-start-1 desk:row-start-3 desk:mt-0 desk:self-end"
          >
            Undergraduate research community
          </Stmt>
          <Stmt
            delay={560}
            className="col-span-3 col-start-1 row-start-4 self-start desk:col-span-3 desk:col-start-4 desk:row-start-4 desk:self-end"
          >
            Media and kinetic art
          </Stmt>
          <Stmt
            delay={620}
            className="col-span-3 col-start-4 row-start-5 mt-lg self-start desk:col-span-3 desk:col-start-10 desk:row-start-4 desk:mt-0 desk:self-end"
          >
            Korea’s first university robotics club
          </Stmt>
        </div>

        {/* Below the desk the supporters roll here, under the first screen. From the desk they are a row of their own (SupportRow). */}
        <div data-sponsors style={at(820)} className="hero-set order-last flex h-[var(--below)] flex-col justify-center desk:hidden">
          <LogoRoll items={[...sponsors, ...cofounded]} />
        </div>

        <HeroCaption
          builds={builds}
          style={at(720)}
          className={`${META} hero-set u-lift mt-md flex items-center justify-between gap-x-lg desk:col-span-7 desk:mt-0 desk:mb-xl desk:col-start-6 desk:row-start-5 desk:self-end`}
        />

        <span
          aria-hidden="true"
          style={at(180)}
          className={`${BIG} hero-letters mt-auto -mr-[0.035em] self-end pb-[var(--gutter)] desk:col-span-7 desk:col-start-6 desk:row-start-6 desk:mt-0 desk:self-end desk:justify-self-end desk:pb-0`}
        >
          <Letters>Intelligence</Letters>
        </span>
      </div>
    </section>
  );
}

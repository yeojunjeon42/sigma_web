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

function Stmt({ className, children }: { className: string; children: React.ReactNode }) {
  return <p className={`${STMT} ${className}`}>{children}</p>;
}

// Logos are set like words of a statement: the letters of each are one capital high (1cap of the
// statement's size) on one baseline, so what rises above (HYUNDAI, the U's dots) rises like an ascender.
function Logos({ label, items, className = "" }: { label: string; items: Sponsor[]; className?: string }) {
  return (
    <div className={className}>
      <p className={`${META} u-lift leading-none text-ink`}>{label}</p>
      <ul className={`${STMT_SIZE} mt-md flex h-[1.75cap] items-end gap-x-lg`}>
        {items.map((s) => (
          <li key={s.id}>
            <a
              href={s.website}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block transition-opacity before:absolute before:top-1/2 before:left-1/2 before:h-11 before:w-[max(100%,2.75rem)] before:-translate-1/2 before:content-[''] hover:opacity-60 lg:before:hidden"
            >
              <Image
                src={s.logo.src}
                alt={s.name}
                width={s.logo.width}
                height={s.logo.height}
                style={{ "--cap": s.logo.cap, "--foot": s.logo.foot } as React.CSSProperties}
                className="-mb-[calc(1cap/var(--cap)*var(--foot))] h-[calc(1cap/var(--cap))] w-auto max-w-none"
              />
            </a>
          </li>
        ))}
      </ul>
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

      <div className="u-sheet relative z-10 flex min-h-[var(--screen)] flex-col pt-[var(--masthead)] desk:grid desk:min-h-[max(var(--screen),38rem)] desk:grid-rows-[auto_repeat(4,minmax(min-content,1fr))_auto] desk:pt-[calc(var(--masthead)+1.5rem)] desk:pb-lg lg:pb-16">
        <div className="flex items-start justify-between pt-md desk:contents">
          <span
            aria-hidden="true"
            className={`${BIG} -ml-[0.046em] desk:col-span-5 desk:col-start-1 desk:row-start-1 desk:self-start`}
          >
            Sigma
          </span>
          <Stmt className="u-trim desk:col-span-3 desk:col-start-10 desk:row-start-1 desk:self-start">
            Est. 1984
          </Stmt>
        </div>

        <div
          data-plate
          className="pointer-events-none absolute inset-x-[var(--gutter)] top-1/2 h-[max(13rem,calc(var(--screen)-14rem))] -translate-y-1/2 desk:inset-auto desk:top-[17%] desk:right-[26%] desk:bottom-[20%] desk:left-[22%] desk:h-auto desk:translate-y-0"
        >
          {builds[0] ? (
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={builds[0].src} alt="" className="h-full w-full object-contain" />
            </noscript>
          ) : null}
        </div>

        <div className="mt-md grid min-h-[13rem] flex-1 [contain:size] grid-cols-2 grid-rows-5 gap-x-gutter desk:mt-0 desk:contents">
          <Stmt
            className="col-start-1 row-start-1 self-start desk:col-span-4 desk:col-start-6 desk:row-start-1 desk:[text-box:trim-both_cap_alphabetic]"
          >
            Seoul National University
          </Stmt>
          <Stmt
            className="col-start-2 row-start-2 self-center justify-self-end text-right desk:col-span-3 desk:col-start-10 desk:row-start-2 desk:self-end desk:justify-self-start desk:text-left"
          >
            Room 215‑2, Mabang
          </Stmt>
          <Stmt
            className="col-start-1 row-start-3 self-center desk:col-span-3 desk:col-start-1 desk:row-start-3 desk:self-end"
          >
            Undergraduate research community
          </Stmt>
          <Stmt
            className="col-start-2 row-start-4 self-center justify-self-end text-right desk:col-span-3 desk:col-start-4 desk:row-start-4 desk:self-end desk:justify-self-start desk:text-left"
          >
            Media and kinetic art
          </Stmt>
          <Stmt
            className="col-start-1 row-start-5 self-end desk:col-span-3 desk:col-start-10 desk:row-start-4 desk:self-end"
          >
            Korea’s first university robotics club
          </Stmt>
        </div>

        <div data-sponsors className="mt-xl grid grid-cols-6 gap-x-gutter desk:col-span-5 desk:col-start-1 desk:row-start-6 desk:mt-0 desk:grid-cols-subgrid desk:self-end">
          <Logos label="Sponsors" items={sponsors} className="col-span-3" />
          <Logos label="Co-founder of" items={cofounded} className="col-span-3 desk:col-span-2" />
        </div>

        <HeroCaption
          builds={builds}
          className={`${META} u-lift mt-xl flex items-center justify-between gap-x-lg desk:col-span-7 desk:mt-0 desk:mb-xl desk:col-start-6 desk:row-start-5 desk:self-end`}
        />

        <span
          aria-hidden="true"
          className={`${BIG} mt-auto -mr-[0.035em] self-end pb-[var(--gutter)] desk:col-span-7 desk:col-start-6 desk:row-start-6 desk:mt-0 desk:self-end desk:justify-self-end desk:pb-0`}
        >
          Intelligence
        </span>
      </div>
    </section>
  );
}

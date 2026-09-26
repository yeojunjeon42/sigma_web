import Image from "next/image";
import HeroPlate, { HeroCaption, type HeroBuild } from "./HeroPlate";
import type { Sponsor } from "@/features/sponsors/api/getSponsors";

const FRAME = {
  "--S": "min(calc((100vw - 2 * var(--gutter)) / 9.8), 4rem)",
  "--Swide": "min(6vw, calc(3.2rem + 2.8vw), 12vh)",
} as React.CSSProperties;

const BIG =
  "u-trim u-knock font-[family-name:var(--f-display)] text-[length:var(--S)] leading-[0.9] font-bold tracking-[-0.02em] text-ink uppercase [font-stretch:125%] md:text-[length:var(--Swide)]";

const STMT =
  "u-knock max-w-[19ch] text-[1rem] leading-[1.1] tracking-[-0.02em] text-ink [word-break:keep-all] [translate:calc(var(--hx,0)*var(--d)*-1px)_calc(var(--hy,0)*var(--d)*-0.6px)] md:text-[length:clamp(0.8125rem,1.7vw,2rem)]";

const META = "font-mono text-[12px] tracking-normal uppercase";

function Stmt({
  depth,
  className,
  children,
}: {
  depth: number;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <p style={{ "--d": depth } as React.CSSProperties} className={`${STMT} ${className}`}>
      {children}
    </p>
  );
}

export default function HeroField({
  sponsors,
  builds,
}: {
  sponsors: Sponsor[];
  builds: HeroBuild[];
}) {
  return (
    <section style={FRAME} className="relative isolate touch-pan-y overflow-hidden bg-canvas">
      <h1 className="sr-only">
        Sigma Intelligence — the robotics club of Seoul National University
      </h1>

      <HeroPlate builds={builds} />

      <div className="relative z-10 flex min-h-svh flex-col px-[var(--gutter)] pt-[var(--masthead)] md:grid md:min-h-[max(100svh,38rem)] md:grid-cols-12 md:grid-rows-[auto_repeat(4,minmax(min-content,1fr))_auto] md:gap-x-[var(--gutter)] md:pt-[calc(var(--masthead)+1.5rem)] md:pb-lg lg:pb-16">
        <div className="flex items-start justify-between pt-md md:contents">
          <span
            aria-hidden="true"
            className={`${BIG} md:col-span-6 md:col-start-1 md:row-start-1 md:self-start`}
          >
            Sigma
          </span>
          <p
            className={`${META} u-knock leading-none text-ink-muted md:col-span-3 md:col-start-10 md:row-start-1 md:self-start md:justify-self-end`}
          >
            Est. 1984
          </p>
        </div>

        <div
          data-plate
          className="pointer-events-none absolute inset-x-[var(--gutter)] top-1/2 h-[max(13rem,calc(100svh-14rem))] -translate-y-1/2 md:inset-auto md:top-[17%] md:right-[22%] md:bottom-[20%] md:left-[22%] md:h-auto md:translate-y-0"
        >
          {builds[0] ? (
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={builds[0].src} alt="" className="h-full w-full object-contain" />
            </noscript>
          ) : null}
        </div>

        <div className="mt-md grid min-h-[13rem] flex-1 [contain:size] grid-cols-2 grid-rows-5 gap-x-md md:mt-0 md:contents">
          <Stmt
            depth={22}
            className="col-start-1 row-start-1 self-start md:col-span-3 md:col-start-7 md:row-start-1"
          >
            Seoul National University
          </Stmt>
          <Stmt
            depth={34}
            className="col-start-2 row-start-2 self-center md:col-span-3 md:col-start-10 md:row-start-2 md:self-end"
          >
            Room 215-2, Mabang
          </Stmt>
          <Stmt
            depth={16}
            className="col-start-1 row-start-3 self-center md:col-span-3 md:col-start-1 md:row-start-3 md:self-end"
          >
            Undergraduate research community
          </Stmt>
          <Stmt
            depth={28}
            className="col-start-2 row-start-4 self-center md:col-span-3 md:col-start-4 md:row-start-5 md:self-start"
          >
            Media and kinetic art
          </Stmt>
          <Stmt
            depth={20}
            className="col-start-1 row-start-5 self-end md:col-span-3 md:col-start-10 md:row-start-4 md:self-center"
          >
            Korea’s first university robotics club
          </Stmt>
        </div>

        <div data-sponsors className="mt-xl flex flex-col items-end gap-y-md text-right md:items-start md:text-left md:col-span-4 md:col-start-1 md:row-start-6 md:mt-0 md:self-end md:pb-0">
          <p className="u-knock max-w-[34ch] text-caption text-ink-muted max-md:hidden">
            We are the robotics club of Seoul National University.
          </p>

          {sponsors.length > 0 && (
            <div>
              <p className={`${META} u-knock leading-none text-ink-muted`}>
                Sponsors
              </p>
              <ul className="mt-md flex flex-wrap items-center justify-end gap-x-xl gap-y-md md:justify-start">
                {sponsors.map((s) => {
                  const logo = s.logo;
                  return (
                    <li key={s.id}>
                      {logo ? (
                        <Image
                          src={logo.src}
                          alt={s.name}
                          width={logo.width}
                          height={logo.height}
                          className="h-7 w-auto object-contain md:h-8"
                        />
                      ) : (
                        <span className={`${META} text-ink-muted`}>{s.name}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <HeroCaption
          builds={builds}
          className={`${META} u-knock mt-xl flex items-center justify-between gap-x-lg md:col-span-5 md:mt-0 md:col-start-8 md:row-start-5 md:justify-end md:self-end`}
        />

        <span
          aria-hidden="true"
          className={`${BIG} mt-auto self-end pb-[var(--gutter)] md:col-span-8 md:col-start-5 md:row-start-6 md:mt-0 md:self-end md:justify-self-end md:pb-0`}
        >
          Intelligence
        </span>
      </div>
    </section>
  );
}

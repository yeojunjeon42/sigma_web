import Image from "next/image";
import type { HistoryEvent } from "../types";
import type { ClubEvent } from "../data/photos";
import { when } from "./Chronology";
import RollingDate from "./RollingDate";

const BIG =
  "font-[family-name:var(--f-display)] [font-stretch:125%] font-bold tabular-nums tracking-[-0.02em] leading-[0.699] text-ink [writing-mode:vertical-rl] text-[length:var(--Y)]";
const CAP = "text-caption text-ink-muted";
const FIGURE = "text-[clamp(2.75rem,1.6rem+2.6vw,4.5rem)] leading-[0.85] tracking-[-0.04em] tabular-nums text-ink";

const MOTION = `
@media (prefers-reduced-motion: no-preference) {
  .hy-in-a { animation: hy-up 640ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both; }
  .hy-in-b { animation: hy-down 640ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both; }
}
@keyframes hy-up { from { opacity: 0; transform: translateY(35%); } }
@keyframes hy-down { from { opacity: 0; transform: translateY(-35%); } }
`;

export default function HistoryHero({
  now,
  facts,
  latest,
  photo,
  event,
}: {
  now: HistoryEvent[];
  facts: { label: string; value: string }[];
  latest: number;
  photo: { src: string; w: number; h: number };
  event: ClubEvent;
}) {
  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-md gap-y-lg pb-xxl pt-[calc(var(--masthead)+var(--spacing-xl))] [--Y:clamp(4rem,12vw,7rem)] lg:min-h-svh lg:grid-cols-12 lg:grid-rows-[auto_minmax(18rem,1fr)_auto] lg:gap-x-lg lg:gap-y-xl lg:pb-lg lg:pt-[calc(var(--masthead)+var(--spacing-lg))] lg:[--Y:min(calc((100svh-var(--masthead)-2*var(--spacing-lg))*0.7/2.83),calc(15vw))]">
      <style>{MOTION}</style>
      <h1 className="contents">
        <span className="sr-only">
          History, 1984 to {latest}
        </span>
        <span
          aria-hidden="true"
          className={`${BIG} u-away [--away:-12svh] max-lg:[animation:none]! col-start-1 row-start-1 self-start justify-self-start lg:col-span-2 lg:row-span-2`}
        >
          <span className="hy-in-a block">
            <span className="-ml-[0.022em] block rotate-180">1984</span>
          </span>
        </span>
      </h1>

      <section aria-label="Now" className="col-span-2 col-start-2 row-start-1 lg:col-span-4 lg:col-start-9">
        <ul className="flex flex-col gap-y-lg">
          {now.slice(0, 2).map((e) => {
            const w = when(e.date);
            return (
              <li key={e.id} className="flex flex-col gap-y-xs">
                <span className={CAP}>
                  {w ? `${w} ${latest}` : e.award ? "Award" : latest}
                </span>
                <span className="text-balance text-lead text-ink lg:text-title">
                  {e.title.en.replaceAll("-", "\u2011")}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <figure className="col-span-3 row-start-2 flex min-h-0 flex-col gap-sm lg:col-span-7 lg:col-start-3 lg:ml-lg">
        <div className="u-corner relative aspect-[4/3] overflow-hidden md:aspect-[16/9] bg-ink/10 lg:aspect-auto lg:min-h-0 lg:flex-1">
          <Image src={photo.src} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <figcaption className={`flex justify-between gap-x-md ${CAP}`}>
          {event.name.replace(/, \d{4}$/, "")}
          <span>{event.when}</span>
        </figcaption>
      </figure>

      <div className="col-span-2 row-start-3 flex flex-col gap-y-lg self-end lg:col-span-4 lg:col-start-1">
        <dl className="grid grid-cols-2 gap-x-lg">
          {facts.map((f) => (
            <div key={f.label} className="flex flex-col-reverse gap-y-xs">
              <dt className={CAP}>
                {f.label}
              </dt>
              <dd className={FIGURE}>{f.value}</dd>
            </div>
          ))}
        </dl>
        <p className={CAP}>
          Running for
          <span className="ml-sm text-lead text-ink [&>span]:inline">
            <RollingDate />
          </span>
        </p>
      </div>

      <span
        aria-hidden="true"
        className={`${BIG} u-away [--away:40svh] [--away-blur:28px] [--away-fade:0] max-lg:[animation:none]! col-start-3 row-start-3 self-end justify-self-end lg:col-span-2 lg:col-start-11 lg:row-span-2 lg:row-start-2 lg:-mr-[0.02em]`}
      >
        <span className="hy-in-b block">{latest}</span>
      </span>
    </header>
  );
}

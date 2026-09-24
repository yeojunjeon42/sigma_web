import Image from "next/image";
import { T } from "@/components/T";
import type { Bilingual, HistoryEvent } from "../types";
import type { ClubEvent } from "../data/photos";
import { when } from "./Chronology";
import RollingDate from "./RollingDate";

// The opening on a diagonal: 1984 reads up from the top left, the latest year down to the bottom
// right, the photograph between them; Now hangs top right, the figures stand bottom left.
// Below lg the same pieces on three columns: 1984 beside Now, the photo, the figures beside the year.

const BIG =
  "font-[family-name:var(--f-display)] [font-stretch:125%] font-bold tabular-nums tracking-[-0.02em] leading-[0.699] text-ink [writing-mode:vertical-rl] text-[length:var(--Y)]";
const CAP = "text-caption text-ink-muted";
// Drops a caption onto the baseline of the lead/title line beside it.
const LIFT = "pt-[0.3rem] lg:pt-2";
const ROW = "grid gap-x-md border-t border-rule py-sm first:border-ink";

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
  facts: { label: Bilingual; value: Bilingual }[];
  latest: number;
  photo: { src: string; w: number; h: number };
  event: ClubEvent;
}) {
  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-md gap-y-lg pb-xxl pt-[calc(var(--masthead)+var(--spacing-xl))] [--Y:clamp(4rem,12vw,7rem)] lg:min-h-svh lg:grid-cols-12 lg:grid-rows-[auto_minmax(18rem,1fr)_auto] lg:gap-x-lg lg:gap-y-xl lg:pb-lg lg:pt-[calc(var(--masthead)+var(--spacing-lg))] lg:[--Y:min(calc((100svh-var(--masthead)-2*var(--spacing-lg))*0.7/2.83),calc(15vw))]">
      <style>{MOTION}</style>
      <h1 className="contents">
        <span className="sr-only">
          <T en="History" ko="연혁" />, 1984 to {latest}
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
        <ul className="border-b border-rule">
          {now.slice(0, 2).map((e) => {
            const w = when(e.date);
            return (
              <li key={e.id} className={`${ROW} grid-cols-[5.5rem_minmax(0,1fr)] lg:grid-cols-[7.5rem_minmax(0,1fr)]`}>
                <span className={`${CAP} ${LIFT}`}>
                  {w ? <T en={`${w.label.en} ${latest}`} ko={`${latest} ${w.label.ko}`} /> : e.award ? <T en="Award" ko="수상" /> : latest}
                </span>
                <span className="text-balance text-lead text-ink lg:text-title">
                  <T en={e.title.en.replaceAll("-", "\u2011")} ko={e.title.ko} />
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
          <T en={event.name.en.replace(/, \d{4}$/, "")} ko={event.name.ko.replace(/, \d{4}$/, "")} />
          <span>{event.when}</span>
        </figcaption>
      </figure>

      <dl className="col-span-2 row-start-3 self-end border-b border-rule lg:col-span-4 lg:col-start-1">
        {facts.map((f) => (
          <div key={f.label.en} className={`${ROW} grid-cols-[minmax(0,1fr)_auto]`}>
            <dt className={`${CAP} ${LIFT}`}>
              <T en={f.label.en} ko={f.label.ko} />
            </dt>
            <dd className="font-mono text-lead tabular-nums tracking-[-0.03em] text-ink lg:text-title">
              <T en={f.value.en} ko={f.value.ko} />
            </dd>
          </div>
        ))}
        <div className={`${ROW} grid-cols-[minmax(0,1fr)_auto]`}>
          <dt className={`${CAP} lg:pt-[0.3rem]`}>
            <T en="Running for" ko="활동 기간" />
          </dt>
          <dd className="text-lead text-ink lg:text-title">
            <RollingDate />
          </dd>
        </div>
      </dl>

      <span
        aria-hidden="true"
        className={`${BIG} u-away [--away:40svh] [--away-blur:28px] [--away-fade:0] max-lg:[animation:none]! col-start-3 row-start-3 self-end justify-self-end lg:col-span-2 lg:col-start-11 lg:row-span-2 lg:row-start-2 lg:-mr-[0.02em]`}
      >
        <span className="hy-in-b block">{latest}</span>
      </span>
    </header>
  );
}

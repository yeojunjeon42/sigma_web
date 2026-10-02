"use client";

import type { Bilingual } from "@/features/site/data/about";
import type { MemberLinks as Links } from "../data/roster";
import MemberLinks from "./MemberLinks";
import { Print, useInView } from "./MemberCrew";

export interface Alumnus {
  id: string;
  name: string;
  field: Bilingual;
  year: number;
  portrait: string | null;
  quote?: string;
  links?: Links;
}

const HANGUL = /[가-힣]/;

// Match MemberCrew portrait widths at each breakpoint; cqw is the full list width.
const FACE =
  "w-[calc((100cqw-24px)/3)] md:w-[calc((100cqw-80px)/6)] lg:w-[calc((100cqw-352px)/10+25.6px)] xl:w-[calc((100cqw-352px)/12+19.2px)]";

function Thumb({ src }: { src: string | null }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`shrink-0 ${FACE}`}>
      <Print src={src} live={seen} portrait sizes="(min-width: 768px) 9rem, 33vw" />
    </div>
  );
}

export default function AlumniList({ alumni }: { alumni: Alumnus[] }) {
  return (
    <ol className="@container border-b border-rule-strong">
      {alumni.map((a) => {
        const ko = a.quote ? HANGUL.test(a.quote) : false;
        return (
          <li key={a.id} className="u-scroll-in flex gap-md border-t border-rule-strong py-md md:gap-xl">
            <Thumb src={a.portrait} />
            <figure className="flex min-w-0 flex-col">
              {a.quote ? (
                <blockquote
                  lang={ko ? "ko" : "en"}
                  className={`max-w-[42ch] font-serif text-[clamp(1.125rem,0.9rem+0.9vw,1.75rem)] leading-[1.25] tracking-[-0.01em] text-ink text-pretty ${ko ? "" : "italic"}`}
                >
                  <p>{`“${a.quote}”`}</p>
                </blockquote>
              ) : null}
              <figcaption className="mt-sm flex flex-wrap items-center gap-x-xs text-body-sm">
                <span className="text-ink">{a.name}</span>
                <span className="text-ink-muted">
                  <span className="tabular-nums">{a.year}</span> · {a.field.en}
                </span>
                {/* Centre hit areas without increasing line height. */}
                <MemberLinks name={a.name} links={a.links} dense className="-my-[11.5px] lg:-my-[5.5px]" />
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ol>
  );
}

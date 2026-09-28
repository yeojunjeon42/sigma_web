"use client";

import type { Bilingual } from "@/features/site/data/about";
import type { MemberLinks as Links } from "../data/roster";
import MemberLinks from "./MemberLinks";
import { Print, useInView } from "./MemberCrew";

export interface Alumnus {
  id: string;
  name: string;
  field: Bilingual;
  gen: string;
  year: number;
  portrait: string | null;
  quote?: string;
  links?: Links;
}

const HANGUL = /[가-힣]/;
const LEFT = "md:col-span-7 md:col-start-1";
const RIGHT = "text-right md:col-span-7 md:col-start-6";

function Thumb({ src }: { src: string | null }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="w-[6.5rem] shrink-0 md:w-32">
      <Print src={src} live={seen} sizes="8rem" />
    </div>
  );
}

export default function AlumniList({ alumni }: { alumni: Alumnus[] }) {
  return (
    <ol className="grid gap-y-section pt-lg md:pt-xl">
      {alumni.map((a, i) => {
        const right = i % 2 === 1;
        const ko = a.quote ? HANGUL.test(a.quote) : false;
        return (
          <li key={a.id} className="u-scroll-in md:grid md:grid-cols-12 md:gap-x-lg">
            <figure className={right ? RIGHT : LEFT}>
              {a.quote ? (
                <blockquote
                  lang={ko ? "ko" : "en"}
                  className={`font-serif text-[clamp(1.5rem,1.05rem+1.9vw,2.75rem)] leading-[1.18] tracking-[-0.01em] text-ink text-pretty ${ko ? "" : "italic"}`}
                >
                  <p>{`“${a.quote}”`}</p>
                </blockquote>
              ) : null}
              <figcaption className={`mt-lg flex gap-md md:gap-lg ${right ? "flex-row-reverse" : ""}`}>
                <Thumb src={a.portrait} />
                <div className={`flex min-w-0 flex-col py-xxs ${right ? "items-end" : "items-start"}`}>
                  <p className="text-title text-ink">{a.name}</p>
                  <p className="mt-xxs text-body-sm text-ink-muted">
                    {a.gen}
                    {" · "}
                    <span className="tabular-nums">{a.year}</span>
                    {" · "}
                    {a.field.en}
                  </p>
                  <MemberLinks name={a.name} links={a.links} className={`mt-auto -mb-xs ${right ? "-mr-xs justify-end" : "-ml-xs"}`} />
                </div>
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ol>
  );
}

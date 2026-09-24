import Link from "next/link";
import { T } from "@/components/T";
import { soleWork } from "../data/works";
import type { Bilingual, YearNode } from "../types";

const META = "text-caption tracking-normal leading-none tabular-nums";
const DATE =
  "u-cap-centre text-body-sm tabular-nums";

type When = { label: Bilingual };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function when(date: string): When | null {
  const d = date.trim();
  if (!d) return null;

  const month = d.match(/^\d{4}-(\d{2})(?:-\d{2}(?:~\d{2})?)?$/);
  if (month) {
    const n = Number(month[1]);
    return { label: { en: MONTHS[n - 1] ?? month[1], ko: `${n}월` } };
  }

  // The two semesters print as their seasons: 1학기 runs March to June, 2학기 September to December.
  const half = d.match(/^\d{4}\s+H([12])$/i);
  if (half) {
    return half[1] === "1"
      ? { label: { en: "Spring", ko: "봄" } }
      : { label: { en: "Fall", ko: "가을" } };
  }

  const season = d.match(/^\d{4}\s+(Summer|Winter|Spring|Autumn|Fall)$/i);
  if (season) {
    const k: Record<string, string> = {
      summer: "여름", winter: "겨울", spring: "봄", autumn: "가을", fall: "가을",
    };
    const en = season[1][0].toUpperCase() + season[1].slice(1).toLowerCase();
    return { label: { en, ko: k[season[1].toLowerCase()] } };
  }

  if (/^\d{4}$/.test(d)) return null;

  return { label: { en: d, ko: d } };
}

export default function Chronology({
  nodes,
}: {
  nodes: YearNode[];
}) {
  return (
    <div className="border-b border-rule">
      {nodes.map((node) => {
        return (
        <section
          key={node.year}
          id={`y${node.year}`}
          className="u-rule-in scroll-mt-[var(--masthead)] border-t border-rule py-lg md:grid md:grid-cols-12 md:items-baseline md:gap-x-lg md:py-xl"
        >
          <div className="mb-xs flex items-start justify-between gap-md md:col-span-2 md:mb-0 md:flex-col md:justify-start md:gap-sm">
            <h2 className="text-body tabular-nums text-ink">{node.year}</h2>
          </div>

          <ul className="u-scroll-fade md:col-span-10">
            {node.events.map((e) => {
              const w = when(e.date);
              const title = (
                <>
                  <T en={e.title.en} ko={e.title.ko} />
                  {e.count && e.count > 1 ? (
                    <span className={`${META} u-cap-centre ml-sm inline-block text-ink-muted`}>
                      ×{e.count}
                    </span>
                  ) : null}
                </>
              );
              const work = e.award ? soleWork(e.work) : undefined;

              return (
                <li
                  key={e.id}
                  id={`e-${e.id}`}
                  className="u-line-cap grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-x-sm py-xxs text-body text-ink md:grid-cols-[6rem_minmax(0,1fr)]"
                >
                  <span
                    className={`${DATE} ${e.award ? "text-accent-deep" : "text-ink-muted"}`}
                  >
                    {e.award ? (
                      <T en="Award" ko="수상" />
                    ) : w ? (
                      <T en={w.label.en} ko={w.label.ko} />
                    ) : null}
                  </span>
                  {work ? (
                    <Link
                      href={`/archive?view=reel&at=${work}`}
                      className="relative transition-opacity before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 hover:opacity-60 lg:before:hidden"
                    >
                      {title}
                      <span aria-hidden="true">{"\u00a0↗"}</span>
                    </Link>
                  ) : (
                    <span>{title}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
        );
      })}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { YEAR_PHOTOS } from "../data/photos";
import { soleWork } from "../data/works";
import { splitResult } from "../splitResult";
import type { YearNode } from "../types";
import RuleIn from "./RuleIn";

const DATE =
  "u-cap-centre text-body-sm tabular-nums";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function when(date: string): string | null {
  const d = date.trim();
  if (!d || /^\d{4}$/.test(d)) return null;
  const month = d.match(/^\d{4}-(\d{2})(?:-\d{2}(?:~\d{2})?)?$/);
  if (month) return MONTHS[Number(month[1]) - 1] ?? month[1];
  const half = d.match(/^\d{4}\s+H([12])$/i);
  if (half) return half[1] === "1" ? "Spring" : "Fall";
  const season = d.match(/^\d{4}\s+(Summer|Winter|Spring|Autumn|Fall)$/i);
  if (season) return season[1][0].toUpperCase() + season[1].slice(1).toLowerCase();
  return d;
}

const SEASON_OF_MONTH = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Fall", "Fall", "Fall", "Winter"];

export function season(label: string) {
  const month = MONTHS.indexOf(label);
  if (month >= 0) return SEASON_OF_MONTH[month];
  return label === "Autumn" ? "Fall" : label;
}

type Result = { label: string; count: number; work?: string };
type Row = { id: string; date: string; award: boolean; event: string; results: Result[] };

// A contest takes one row in a year, with all its results on the same line.
export function rowsOf(events: YearNode["events"]) {
  const rows: Row[] = [];
  for (const e of events) {
    const [event, result] = splitResult(e.title.en);
    const twin = e.award ? rows.find((r) => r.award && r.event === event) : undefined;
    const row = twin ?? { id: e.id, date: e.date, award: !!e.award, event, results: [] };
    if (!twin) rows.push(row);
    if (result) row.results.push({ label: result, count: e.count ?? 1, work: soleWork(e.work) });
  }
  return rows;
}

// A year reads by season, each named once at the start of its run.
function seasonLabels(rows: Row[]) {
  let last: string | null = null;
  return rows.map((e) => {
    const w = e.award ? null : when(e.date);
    if (!w) return null;
    const s = season(w);
    if (s === last) return null;
    last = s;
    return s;
  });
}

export default function Chronology({
  nodes,
}: {
  nodes: YearNode[];
}) {
  return (
    <div className="border-b border-rule max-md:-mx-[var(--gutter)] max-md:px-[var(--gutter)] md:col-span-full md:grid md:grid-cols-subgrid">
      <RuleIn />
      {nodes.map((node) => {
        const rows = rowsOf(node.events);
        const seasons = seasonLabels(rows);
        return (
        <section
          key={node.year}
          id={`y${node.year}`}
          className="u-rule-in scroll-mt-[var(--masthead)] border-t border-rule py-lg max-md:-mx-[var(--gutter)] max-md:px-[var(--gutter)] md:col-span-full md:grid md:grid-cols-subgrid md:items-baseline md:py-xl"
        >
          <div className="mb-md flex items-start justify-between gap-md md:mb-0 md:flex-col md:justify-start md:gap-sm lg:col-span-2">
            <h2 className="-ml-[0.042em] font-[family-name:var(--f-display)] text-[length:clamp(3rem,14vw,4.5rem)] font-bold leading-none tracking-[-0.02em] tabular-nums text-ink [font-stretch:125%] md:ml-0 md:text-body md:font-semibold md:tracking-normal">{node.year}</h2>
          </div>

          {YEAR_PHOTOS[node.year] ? (
            <Image
              src={YEAR_PHOTOS[node.year].src}
              alt={YEAR_PHOTOS[node.year].alt}
              width={YEAR_PHOTOS[node.year].w}
              height={YEAR_PHOTOS[node.year].h}
              sizes="100vw"
              className="mb-md aspect-[4/3] w-full object-cover md:hidden"
            />
          ) : null}

          {/* Below md the dates take only the longest label's width, which falls between column lines. */}
          <ul data-offgrid className="u-scroll-fade md:col-start-2 md:col-end-[-1] md:grid md:grid-cols-subgrid lg:col-start-3">
            {rows.map((r, i) => (
              <li
                key={r.id}
                id={`e-${r.id}`}
                className="u-line-cap grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-x-gutter py-xxs text-body text-ink md:col-span-full md:grid-cols-subgrid"
              >
                <span className={`${DATE} text-ink-muted whitespace-nowrap md:col-span-2 lg:col-span-1`}>
                  {r.award ? "Award" : seasons[i]}
                </span>
                {/* When the results don't fit beside the event they drop to its left edge, whole. */}
                <span className="flex flex-wrap gap-x-sm md:col-start-3 md:col-end-[-1] lg:col-start-2">
                  <span className="min-w-0">{r.event}</span>
                  {r.results.length ? (
                    <span className="min-w-0 text-ink-muted">
                      {r.results.map((x, k) => (
                        <Fragment key={k}>
                          {k > 0 ? ", " : null}
                          <span className="whitespace-nowrap">
                            {x.work ? (
                              <Link
                                href={`/archive?view=reel&at=${x.work}`}
                                className="u-swipe relative before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 lg:before:hidden"
                              >
                                {x.label}
                                <span aria-hidden="true">{"\u00a0↗"}</span>
                              </Link>
                            ) : (
                              x.label
                            )}
                            {x.count > 1 ? ` ×${x.count}` : null}
                          </span>
                        </Fragment>
                      ))}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
        );
      })}
    </div>
  );
}

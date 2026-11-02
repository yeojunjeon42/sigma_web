import Link from "next/link";
import { soleWork } from "../data/works";
import type { YearNode } from "../types";
import RuleIn from "./RuleIn";

const META = "text-caption tracking-normal leading-none tabular-nums";
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

export default function Chronology({
  nodes,
}: {
  nodes: YearNode[];
}) {
  return (
    <div className="border-b border-rule max-md:-mx-[var(--gutter)] max-md:px-[var(--gutter)] md:col-span-full md:grid md:grid-cols-subgrid">
      <RuleIn />
      {nodes.map((node) => {
        return (
        <section
          key={node.year}
          id={`y${node.year}`}
          className="u-rule-in scroll-mt-[var(--masthead)] border-t border-rule py-lg max-md:-mx-[var(--gutter)] max-md:px-[var(--gutter)] max-md:even:bg-surface md:col-span-full md:grid md:grid-cols-subgrid md:items-baseline md:py-xl"
        >
          <div className="mb-xs flex items-start justify-between gap-md md:mb-0 md:flex-col md:justify-start md:gap-sm lg:col-span-2">
            <h2 className="text-body tabular-nums text-ink">{node.year}</h2>
          </div>

          <ul className="u-scroll-fade md:col-start-2 md:col-end-[-1] md:grid md:grid-cols-subgrid lg:col-start-3">
            {node.events.map((e) => {
              const w = when(e.date);
              const title = (
                <>
                  {/* Keep the dash with the preceding word. */}
                  {e.title.en.replaceAll(" — ", "\u00a0— ")}
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
                  className="u-line-cap grid grid-cols-6 items-baseline gap-x-gutter py-xxs text-body text-ink md:col-span-full md:grid-cols-subgrid"
                >
                  <span
                    className={`${DATE} col-span-2 lg:col-span-1 ${e.award ? "text-accent-deep" : "text-ink-muted"}`}
                  >
                    {e.award ? (
                      "Award"
                    ) : w ? (
                      w
                    ) : null}
                  </span>
                  {work ? (
                    <Link
                      href={`/archive?view=reel&at=${work}`}
                      className="u-swipe relative col-start-3 col-end-[-1] justify-self-start lg:col-start-2 before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 lg:before:hidden"
                    >
                      {title}
                      <span aria-hidden="true">{"\u00a0↗"}</span>
                    </Link>
                  ) : (
                    <span className="col-start-3 col-end-[-1] lg:col-start-2">{title}</span>
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

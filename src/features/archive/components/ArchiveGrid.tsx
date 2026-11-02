import type { CSSProperties } from "react";
import Link from "next/link";
import Pending from "./Pending";
import PlateArt from "./PlateArt";
import type { ReelBuild, ReelGroup } from "./ArchiveReel";
import { CLEAR } from "../data/field";

const MARGIN = { scrollMarginTop: "calc(var(--masthead) + 1rem)" };
const CELL: CSSProperties = { aspectRatio: "1 / 1" };

export default function ArchiveGrid({
  builds,
  groups,
  open,
}: {
  builds: ReelBuild[];
  groups: ReelGroup[];
  open: (id: string) => string;
}) {
  return (
    <div className="u-gutter">
      {groups.map((g, n) => (
        <section key={`${g.label}-${g.from}`} className={n === 0 ? "" : "mt-xxl"}>
          {g.label ? (
            <h2
              id={`feed-era-${g.label.replace("–", "-")}`}
              style={MARGIN}
              className="archive-era u-trim text-display-md tabular-nums text-ink"
            >
              {g.label}
            </h2>
          ) : null}

          <ul
            className={`grid grid-cols-2 gap-gutter md:grid-cols-3 ${
              g.label ? "mt-lg" : ""
            }`}
          >
            {builds.slice(g.from, g.to).map((b, i) => (
              <li key={b.id} id={`b-${b.id}`} style={MARGIN}>
                <Link href={open(b.id)} prefetch={false} className="group relative block transition-opacity has-[[data-pending]]:opacity-50 has-[[data-pending]]:delay-150">
                  <Pending />
                  <PlateArt
                    tile={b.tile.kind === "lift" ? { ...b.tile, box: CLEAR } : b.tile}
                    sizes="(min-width: 768px) 23vw, (min-width: 640px) 31vw, 46vw"
                    eager={g.from + i < 4}
                    style={CELL}
                  />
                  <div data-offgrid className="absolute inset-x-sm bottom-sm">
                    <h3 className="u-trim u-knock font-[family-name:var(--f-display)] font-semibold [font-stretch:125%] text-body-sm text-balance text-ink transition-colors [--color-canvas:var(--color-surface-sunken)] group-hover:text-ink-muted">
                      {b.name}
                      {b.award ? (
                        <span className="md:hidden">
                          <span aria-hidden="true" className="ml-xs inline-block size-[0.34em] bg-accent align-[0.167em]" />
                          <span className="sr-only">{b.award}</span>
                        </span>
                      ) : null}
                    </h3>
                    {b.award ? (
                      <p className="mt-xxs truncate text-caption text-accent-deep max-md:hidden">{b.award}</p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

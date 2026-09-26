import type { CSSProperties } from "react";
import Link from "next/link";
import PlateArt from "./PlateArt";
import type { ReelBuild, ReelGroup } from "./ArchiveReel";

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
            className={`grid grid-cols-2 gap-sm md:grid-cols-3 ${
              g.label ? "mt-lg" : ""
            }`}
          >
            {builds.slice(g.from, g.to).map((b, i) => (
              <li key={b.id} id={`b-${b.id}`} style={MARGIN}>
                <Link href={open(b.id)} prefetch={false} className="group block">
                  <PlateArt
                    tile={b.tile}
                    sizes="(min-width: 768px) 23vw, (min-width: 640px) 31vw, 46vw"
                    eager={g.from + i < 4}
                    style={CELL}
                  />
                  <h3 className="mt-sm text-body-sm text-balance text-ink transition-colors group-hover:text-ink-muted">
                    {b.name}
                    <span aria-hidden="true" className="text-ink-muted">
                      {" ↗"}
                    </span>
                  </h3>
                  <Caption b={b} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Caption({ b }: { b: ReelBuild }) {
  const size = b.team?.length ?? 0;
  const line = b.award ? (
    <span className="text-accent-deep">
      {b.award}
    </span>
  ) : size > 1 ? (
    `${size} members`
  ) : b.tags[0] ? (
    b.tags[0]
  ) : null;
  if (!line) return null;
  return <p className="mt-xxs truncate text-caption text-ink-muted">{line}</p>;
}

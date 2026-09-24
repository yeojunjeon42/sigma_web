import type { CSSProperties } from "react";
import Link from "next/link";
import { T } from "@/components/T";
import PlateArt from "./PlateArt";
import type { ReelBuild, ReelGroup } from "./ArchiveReel";

const MARGIN = { scrollMarginTop: "calc(var(--masthead) + 1rem)" };
/** Every cell the same square, so the grid reads as an index and not as a scatter. */
const CELL: CSSProperties = { aspectRatio: "1 / 1" };

/**
 * The archive without a pointer (below `lg`): every build in one grid, era by era, each cell
 * the same size. Nothing here depends on hover — the photograph is on the tile and a tap opens
 * the entry.
 */
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
                  <h3 className="mt-sm text-body-sm text-balance text-ink transition-colors group-hover:text-ink-subtle">
                    <T en={b.name.en} ko={b.name.ko} />
                    <span aria-hidden="true" className="text-ink-subtle">
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

// The era heading already says the year, so the caption carries what it does not: a result,
// else the size of the team, else the first tag.
function Caption({ b }: { b: ReelBuild }) {
  const size = b.team?.length ?? 0;
  const line = b.award ? (
    <span className="text-accent-deep">
      <T en={b.award.en} ko={b.award.ko} />
    </span>
  ) : size > 1 ? (
    <T en={`${size} members`} ko={`${size}명`} />
  ) : b.tags[0] ? (
    <T en={b.tags[0].en} ko={b.tags[0].ko} />
  ) : null;
  if (!line) return null;
  return <p className="mt-xxs truncate text-caption text-ink-muted">{line}</p>;
}

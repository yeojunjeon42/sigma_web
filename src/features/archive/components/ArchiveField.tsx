import type { CSSProperties } from "react";
import Link from "next/link";
import { Container } from "@/components/ui";
import type { Sort } from "../api/getArchive";
import { eraLabel, type ArchiveProject } from "../types";
import type { Look } from "../data/covers";
import { tileFor, type Tile } from "../data/field";
import { splitTitle } from "./splitTitle";
import FieldPrint from "./FieldPrint";
import PlateArt from "./PlateArt";
import PlateHandoff from "./PlateHandoff";

const MARGIN: CSSProperties = { scrollMarginTop: "calc(var(--masthead) + var(--spacing-lg))" };
const SQUARE: CSSProperties = { aspectRatio: "1 / 1" };
// Centres a cut-out with room for the name at the plate's foot. No tile is drawn, so it can run larger than the phone's.
const OBJECT: Tile["box"] = [0.05, 0.05, 0.9, 0.9];
const BIG =
  "u-trim font-[family-name:var(--f-display)] [font-stretch:125%] font-bold tabular-nums tracking-[-0.02em] text-[clamp(2.75rem,6.4vw,6rem)] leading-none text-ink";

interface FieldGroup {
  era: string | null;
  projects: ArchiveProject[];
}

type Band = { key: string; id?: string; note?: string; projects: ArchiveProject[] };

// Year keeps its eras. Team size and Name fall into their own landmarks: a number, or a letter.
function bandsOf(groups: FieldGroup[], sort: Sort, teamSize: Map<string, number>): Band[] {
  if (sort === "year") {
    return groups.map((g) => ({ key: g.era ?? "", id: g.era ? `era-${g.era}` : undefined, projects: g.projects }));
  }
  const by = new Map<string, ArchiveProject[]>();
  for (const p of groups.flatMap((g) => g.projects)) {
    const key = sort === "team" ? String(teamSize.get(p.id) ?? "—") : splitTitle(p.title).en.charAt(0).toUpperCase();
    by.set(key, [...(by.get(key) ?? []), p]);
  }
  const rank = (k: string) => (k === "—" ? -1 : Number(k));
  return [...by]
    .sort(([a], [b]) => (sort === "team" ? rank(b) - rank(a) : a.localeCompare(b, "en")))
    .map(([key, projects]) => ({
      key,
      note: sort === "team" ? (key === "—" ? "Team size unknown" : key === "1" ? "person" : "people") : undefined,
      projects,
    }));
}

type Spot = { project: ArchiveProject; large: boolean; column: number; row: number; foot: boolean };

// One large plate beside two small, then mirrored. A lone small plate stands level with the large one's foot.
function rhythm(items: ArchiveProject[], mirrored: boolean): Spot[] {
  const spots: Spot[] = [];
  let flip = mirrored;
  for (let i = 0, row = 1; i < items.length; i += 3, row += 2, flip = !flip) {
    const [a, b, c] = items.slice(i, i + 3);
    const side = flip ? 1 : 7;
    spots.push({ project: a, large: true, column: flip ? 4 : 1, row, foot: false });
    if (b && c) {
      spots.push({ project: b, large: false, column: side, row, foot: false });
      spots.push({ project: c, large: false, column: side, row: row + 1, foot: true });
    } else if (b) {
      spots.push({ project: b, large: false, column: side, row: row + 1, foot: true });
    }
  }
  return spots;
}

export default function ArchiveField({
  groups,
  teamSize,
  sort,
  look,
  eager = true,
  reelHref,
}: {
  groups: FieldGroup[];
  teamSize: Map<string, number>;
  sort: Sort;
  look: Look;
  eager?: boolean;
  reelHref: (id: string) => string;
}) {
  // Award first, then team size, so the first of each three is the one that goes large.
  const weight = (p: ArchiveProject) =>
    (p.award ? 100 : 0) + (teamSize.get(p.id) ?? 0) - (tileFor(p, look).kind === "none" ? 1000 : 0);
  const bands = bandsOf(groups, sort, teamSize).map((b) => ({
    ...b,
    projects: [...b.projects].sort((x, y) => weight(y) - weight(x)),
  }));
  const printKey = `${look}|${bands.flatMap((b) => b.projects.map((p) => p.id)).join()}`;

  return (
    <Container>
      <div data-field className="relative pt-xxl">
        <FieldPrint key={printKey} />
        <PlateHandoff />
        {bands.map((band, n) => (
          <section
            key={band.key}
            id={band.id}
            style={MARGIN}
            className={`grid grid-cols-12 gap-x-gutter ${n ? "mt-section" : ""}`}
          >
            <div className="sticky top-[calc(var(--masthead)+var(--spacing-lg))] col-span-3 self-start">
              <h2 className={BIG}>{band.key}</h2>
              {band.note ? <p className="mt-sm text-body-sm text-ink-muted">{band.note}</p> : null}
            </div>
            <ul className="col-span-9 grid grid-cols-subgrid gap-y-gutter">
              {rhythm(band.projects, n % 2 === 1).map(({ project: p, large, column, row, foot }, i) => {
                const tile = tileFor(p, look);
                return (
                  <li
                    key={p.id}
                    style={{
                      gridColumn: `${column} / span ${large ? 6 : 3}`,
                      gridRow: `${row} / span ${large ? 2 : 1}`,
                    }}
                    className={foot ? "self-end" : "self-start"}
                  >
                    <Link
                      href={reelHref(p.id)}
                      data-plate-link
                      data-vt-id={p.id}
                      className="group/plate relative block"
                    >
                      <PlateArt
                        tile={tile.kind === "lift" && look === "object" ? { ...tile, box: OBJECT } : tile}
                        sizes={large ? "32vw" : "16vw"}
                        eager={eager && n === 0 && i < 3}
                        plain
                        style={SQUARE}
                        className="w-full opacity-0"
                      />
                      <canvas aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
                      <h3 className="u-trim absolute inset-x-0 bottom-0 z-10 font-[family-name:var(--f-display)] font-semibold [font-stretch:125%] text-body-sm text-ink transition-colors group-hover/plate:text-ink-muted">
                        {splitTitle(p.title).en}
                      </h3>
                      <span className="sr-only">
                        {p.year ?? eraLabel(p.era)}
                        {p.award ? `, ${p.award.en}` : ""}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}

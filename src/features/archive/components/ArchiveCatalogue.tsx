import Link from "next/link";
import { T } from "@/components/T";
import { Container } from "@/components/ui";
import { displayTags } from "@/features/content/data/tags";
import type { ArchiveProject, Bilingual } from "../types";
import type { Look } from "../data/covers";
import type { Sort } from "../api/getArchive";
import { tileFor } from "../data/field";
import { splitTitle } from "./splitTitle";
import { commonTags } from "./commonTags";
import PlateArt from "./PlateArt";
import ResolvePlate from "./ResolvePlate";

/**
 * The catalogue — a ledger, one build to a line: its name, two tags, the team and the year. The
 * era prints once, beside its first build. From `lg` the names rest in the subtler ink and the
 * line under the pointer turns dark, with the build printed through the screen beside its name.
 */
export interface CatalogueGroup {
  era: Bilingual | null;
  projects: ArchiveProject[];
}

const META = "text-caption tracking-normal leading-[1.35]";
const COLS = "md:grid md:grid-cols-12 md:gap-x-lg";
// A row is set to the name's size and aligned by baseline; the smaller cells are lifted so
// their capitals centre on the name's (see `u-line-cap` in globals.css).
/**
 * Every cell is trimmed to its own capitals, and the row centres those boxes. The row used to
 * align by baseline and lift each smaller piece by `(1cap - var(--line-cap)) / 2`; measured, that
 * left the name 2.53px below every other cell in its row, because the row's `--line-cap` and the
 * name's rendered cap are not the same number. Trimmed boxes need no arithmetic — measured
 * spread across a row: 0.00px.
 */
const LIFT = "u-trim";

// The preview stands at the end of the name column, centred on its row, clear of every name.
function Preview({ project, look }: { project: ArchiveProject; look: Look }) {
  const tile = tileFor(project, look);
  return (
    <span
      aria-hidden="true"
      className="u-corner pointer-events-none absolute top-1/2 right-0 z-30 hidden w-[12rem] -translate-y-1/2 overflow-hidden lg:group-hover/row:block lg:group-focus-visible/row:block"
    >
      {tile.kind === "photo" && tile.src ? (
        <ResolvePlate tile={tile} sizes="256px" />
      ) : (
        <PlateArt tile={tile} sizes="256px" hover className="w-full" />
      )}
      {project.award ? (
        <span className="flex gap-x-xs bg-canvas-inverse px-xs py-xs text-caption text-ink-inverse">
          <span className="text-accent">•</span>
          <span>
            <T en={project.award.en} ko={project.award.ko} />
          </span>
        </span>
      ) : null}
    </span>
  );
}

function Row({
  project,
  era,
  anchor,
  href,
  tags,
  team,
  look,
}: {
  project: ArchiveProject;
  era: Bilingual | null;
  /** Set on the first build of an era, so the header's year can scroll here. */
  anchor?: string;
  /** The reel, opened at this build — where the entry is read. */
  href: string;
  tags: Bilingual[];
  team?: number;
  look: Look;
}) {
  const name = splitTitle(project.title);
  const year = project.year ?? project.era.replace("-", "–");

  const body = (
    <div
      className={`relative grid grid-cols-[1fr_auto] items-center gap-x-md gap-y-xs py-md ${COLS} md:text-title lg:py-xs`}
    >
      <p className={`hidden text-body md:col-span-1 md:block ${LIFT}`}>
        {era ? (
          <span className="text-body tabular-nums text-ink">{era.en}</span>
        ) : null}
      </p>
      <div className="pointer-events-none absolute inset-y-0 hidden md:left-[calc((100%-11*var(--spacing-lg))/12+var(--spacing-lg))] md:right-[calc(4*(100%-11*var(--spacing-lg))/12+4*var(--spacing-lg))] lg:block" aria-hidden="true">
        <Preview project={project} look={look} />
      </div>
      <h3
        className={`u-trim text-title text-ink transition-[translate,color] duration-200 ease-out motion-reduce:transition-none md:col-span-7 lg:text-ink-subtle lg:group-hover/row:translate-x-sm lg:group-hover/row:text-ink lg:group-focus-visible/row:translate-x-sm lg:group-focus-visible/row:text-ink`}
      >
        <T en={name.en} ko={name.ko} />
        <span className="text-ink-subtle">{"\u00a0↗"}</span>
        {project.award ? (
          <>
            <span aria-hidden="true" className="ml-xs align-middle text-body text-accent">
              •
            </span>
            <span className="sr-only">
              <T en={project.award.en} ko={project.award.ko} />
            </span>
          </>
        ) : null}
      </h3>
      {/* One line on a wide screen: the tags that fit, whole, and the rest left out. */}
      <p
        className={`col-span-2 row-start-2 flex flex-wrap gap-x-sm text-ink-subtle md:col-span-2 md:row-start-auto md:h-[1lh] md:overflow-hidden ${META} ${LIFT}`}
      >
        {tags.map((t) => (
          <span key={t.ko} className="md:my-[calc((1lh-1cap)/2)] md:[text-box:trim-both_cap_alphabetic]">
            <T en={t.en} ko={t.ko} />
          </span>
        ))}
      </p>
      <p className={`hidden tabular-nums text-ink-subtle md:col-span-1 md:block ${META} ${LIFT}`}>
        {team ?? "—"}
      </p>
      <p
        className={`col-start-2 row-start-1 justify-self-end text-body-sm tabular-nums text-ink-subtle md:col-span-1 md:col-start-auto md:row-start-auto md:text-right ${LIFT}`}
      >
        {year}
      </p>
    </div>
  );

  return (
    <li
      id={`l-${project.id}`}
      data-vt-id={project.id}
      style={{ scrollMarginTop: "calc(var(--masthead) + 1rem)" }}
      className="u-scroll-fade relative border-b border-rule transition-colors lg:has-[a:hover]:z-20 lg:has-[a:hover]:border-ink lg:has-[a:focus-visible]:z-20"
    >
      {/* Where the era filter lands. A year in the header walks the catalogue to its era the
          way it walks the field, rather than filtering the record down to it. */}
      {anchor ? (
        <span
          id={anchor}
          aria-hidden="true"
          style={{ scrollMarginTop: "calc(var(--masthead) + 2rem)" }}
          className="pointer-events-none absolute top-0 left-0 block size-px"
        />
      ) : null}
      <Link href={href} className="group/row block">
        {body}
      </Link>
    </li>
  );
}

export default function ArchiveCatalogue({
  groups,
  tags,
  teamSize,
  sort,
  sortHref,
  look,
  reelHref,
}: {
  groups: CatalogueGroup[];
  tags: Map<string, string[]>;
  teamSize: Map<string, number>;
  sort: Sort;
  sortHref: Record<Sort, string>;
  look: Look;
  reelHref: (id: string) => string;
}) {
  const head = (key: Sort, label: Bilingual, className: string) => (
    <Link
      href={sortHref[key]}
      data-vt
      aria-current={sort === key ? "true" : undefined}
      className={`${className} relative transition-colors before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 lg:before:hidden ${
        sort === key ? "text-ink" : "hover:text-ink"
      }`}
    >
      <T en={label.en} ko={label.ko} />
      {sort === key ? " ↓" : ""}
    </Link>
  );

  return (
    <section className="relative">
      <Container>
        <div className={`hidden border-b border-rule-strong pb-sm text-ink-subtle ${COLS} ${META}`}>
          <span className="md:col-span-1">
            <T en="Era" ko="시기" />
          </span>
          {head("name", { en: "Name", ko: "이름" }, "md:col-span-7")}
          <span className="md:col-span-2">
            <T en="Tags" ko="분야" />
          </span>
          {head("team", { en: "Team", ko: "인원" }, "md:col-span-1")}
          {head("year", { en: "Year", ko: "연도" }, "md:col-span-1 md:text-right")}
        </div>
        <ul>
          {groups.flatMap((g) => {
            const common = commonTags(g.projects, tags);
            return g.projects.map((p, i) => (
              <Row
                key={p.id}
                project={p}
                era={i === 0 ? g.era : null}
                anchor={i === 0 && g.era ? `era-${g.era.en.replace("\u2013", "-")}` : undefined}
                href={reelHref(p.id)}
                tags={displayTags((tags.get(p.id) ?? []).filter((t) => !common.has(t)), 2)}
                team={teamSize.get(p.id)}
                look={look}
              />
            ));
          })}
        </ul>
      </Container>
    </section>
  );
}

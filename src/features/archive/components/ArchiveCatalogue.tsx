import Link from "next/link";
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

interface CatalogueGroup {
  era: string | null;
  projects: ArchiveProject[];
}

const META = "text-caption tracking-normal leading-[1.35]";
const COLS = "md:grid md:grid-cols-12 md:gap-x-lg";
const LIFT = "u-trim";

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
          <span aria-hidden="true" className="inline-block size-[0.5em] shrink-0 self-center bg-accent" />
          <span>
            {project.award.en}
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
  era: string | null;
  anchor?: string;
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
          <span className="text-body tabular-nums text-ink">{era}</span>
        ) : null}
      </p>
      <div className="pointer-events-none absolute inset-y-0 hidden md:left-[calc((100%-11*var(--spacing-lg))/12+var(--spacing-lg))] md:right-[calc(4*(100%-11*var(--spacing-lg))/12+4*var(--spacing-lg))] lg:block" aria-hidden="true">
        <Preview project={project} look={look} />
      </div>
      <h3
        className={`u-trim text-title text-ink transition-[translate,color] duration-200 ease-out motion-reduce:transition-none md:col-span-7 lg:text-ink-muted lg:group-hover/row:translate-x-sm lg:group-hover/row:text-ink lg:group-focus-visible/row:translate-x-sm lg:group-focus-visible/row:text-ink`}
      >
        {name.en}
        <span className="text-ink-muted">{"\u00a0↗"}</span>
        {project.award ? (
          <>
            <span aria-hidden="true" className="ml-xs inline-block size-[0.34em] bg-accent align-[calc((1cap-0.34em)/2)]" />
            <span className="sr-only">
              {project.award.en}
            </span>
          </>
        ) : null}
      </h3>
      <p
        className={`col-span-2 row-start-2 flex flex-wrap gap-x-sm text-ink-muted md:col-span-2 md:row-start-auto md:h-[1lh] md:overflow-hidden ${META} ${LIFT}`}
      >
        {tags.map((t) => (
          <span key={t.ko} className="md:my-[calc((1lh-1cap)/2)] md:[text-box:trim-both_cap_alphabetic]">
            {t.en}
          </span>
        ))}
      </p>
      <p className={`hidden tabular-nums text-ink-muted md:col-span-1 md:block ${META} ${LIFT}`}>
        {team ?? "—"}
      </p>
      <p
        className={`col-start-2 row-start-1 justify-self-end text-body-sm tabular-nums text-ink-muted md:col-span-1 md:col-start-auto md:row-start-auto md:text-right ${LIFT}`}
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
  const head = (key: Sort, label: string, className: string) => (
    <Link
      href={sortHref[key]}
      data-vt
      aria-current={sort === key ? "true" : undefined}
      className={`${className} relative transition-colors before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 lg:before:hidden ${
        sort === key ? "text-ink" : "hover:text-ink"
      }`}
    >
      {label}
      {sort === key ? (
        <svg aria-hidden="true" viewBox="0 0 10 10" className="ml-[0.3em] inline-block h-[1cap] w-[1cap] align-baseline" fill="none" stroke="currentColor" strokeWidth="1.1">
          <path d="M5 0.5v8.6M1.4 5.6 5 9.2l3.6-3.6" />
        </svg>
      ) : null}
    </Link>
  );

  return (
    <section className="relative">
      <Container>
        <div className={`hidden border-b border-rule-strong pb-sm text-ink-muted ${COLS} ${META}`}>
          <span className="md:col-span-1">
            Era
          </span>
          {head("name", "Name", "md:col-span-7")}
          <span className="md:col-span-2">
            Tags
          </span>
          {head("team", "Team", "md:col-span-1")}
          {head("year", "Year", "md:col-span-1 md:text-right")}
        </div>
        <ul>
          {groups.flatMap((g) => {
            const common = commonTags(g.projects, tags);
            return g.projects.map((p, i) => (
              <Row
                key={p.id}
                project={p}
                era={i === 0 ? g.era : null}
                anchor={i === 0 && g.era ? `era-${g.era.replace("\u2013", "-")}` : undefined}
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

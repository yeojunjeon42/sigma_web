import { Suspense } from "react";
import type { Metadata } from "next";
import { share } from "@/app/share";
import { pick, type Locale } from "@/i18n/config";
import { ARCHIVE_TEXT } from "@/i18n/dict/archive";
import { META } from "@/i18n/dict/meta";
import Link from "@/i18n/Link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Container, GridField } from "@/components/ui";
import {
  getArchiveWithMedia,
  parseEra,
  parseSort,
  sortArchive,
  type Sort,
} from "@/features/archive/api/getArchive";
import ArchiveField from "@/features/archive/components/ArchiveField";
import ArchiveEntry from "@/features/archive/components/ArchiveEntry";
import ArchiveGrid from "@/features/archive/components/ArchiveGrid";
import ArchiveTransitions from "@/features/archive/components/ArchiveTransitions";
import ArchiveReel, {
  type ReelBuild,
  type ReelGroup,
} from "@/features/archive/components/ArchiveReel";
import { commonTags } from "@/features/archive/components/commonTags";
import { splitTitle } from "@/features/archive/components/splitTitle";
import ArchiveCatalogue from "@/features/archive/components/ArchiveCatalogue";
import { DEFAULT_LOOK, parseLook, type Look } from "@/features/archive/data/covers";
import { tileFor } from "@/features/archive/data/field";
import { displayTags } from "@/features/content/data/tags";
import { ERAS, eraLabel, type ArchiveProject, type Era } from "@/features/archive/types";
import { getEntries } from "@/features/archive/api/getEntries";
import { getIndex } from "@/features/content/api/getContent";
import YearRuler, { type Mark } from "@/features/history/components/YearRuler";
import AddBuild from "@/features/archive/components/AddBuild";

export function archiveMeta(locale: Locale): Metadata {
  const { title, description } = META[locale].archive;
  return { title, description, ...share(locale, "/archive", { title, description }) };
}

const ON = "text-ink";
const OFF = "text-ink-muted transition-colors hover:text-ink";

const NEWEST = ERAS.toReversed();

type View = "depth" | "reel" | "list";

function base(era: Era | null, sort: Sort, look: Look) {
  const q = new URLSearchParams();
  if (era) q.set("era", era);
  if (sort !== "year") q.set("sort", sort);
  if (look !== DEFAULT_LOOK) q.set("look", look);
  return q.toString();
}

function href(era: Era | null, view: View, sort: Sort, look: Look, at?: string) {
  const q = new URLSearchParams(base(era, sort, look));
  if (view !== "depth") q.set("view", view);
  if (at) q.set("at", at);
  const s = q.toString();
  return s ? `/archive?${s}` : "/archive";
}

const SORTS: Sort[] = ["year", "team", "name"];
const VIEWS: View[] = ["depth", "reel", "list"];

export type ArchiveQuery = { era?: string; view?: string; sort?: string; look?: string; at?: string };

export default async function ArchiveView({
  locale,
  query,
  phone,
  eager = true,
}: {
  locale: Locale;
  query: ArchiveQuery;
  phone: boolean;
  eager?: boolean;
}) {
  const { era: eraParam, view: viewParam, sort: sortParam, look: lookParam, at } = query;
  const look = parseLook(lookParam);
  const era = parseEra(eraParam);
  const view: View = viewParam === "list" || viewParam === "reel" ? viewParam : "depth";
  const sort = parseSort(sortParam);
  const t = ARCHIVE_TEXT[locale];

  const [all, entries, docs] = await Promise.all([
    getArchiveWithMedia(),
    getEntries(locale),
    getIndex("archive", locale),
  ]);
  const teamSize = new Map(
    docs.filter((d) => d.team.length > 0).map((d) => [d.slug, d.team.length]),
  );
  const tags = new Map(docs.map((d) => [d.slug, d.tags]));
  const filtered = era ? all.filter((p) => p.era === era) : all;
  const sorted = sortArchive(filtered, sort, teamSize, locale);

  const groups: { era: string | null; projects: ArchiveProject[] }[] =
    sort === "year"
      ? NEWEST.map((e) => ({
          era: e.label,
          projects: sorted.filter((p) => p.era === e.key),
        })).filter((g) => g.projects.length > 0)
      : [{ era: null, projects: sorted }];

  const reelBuilds: ReelBuild[] = [];
  const reelGroups: ReelGroup[] = [];
  for (const g of groups) {
    const common = commonTags(g.projects, tags);
    reelGroups.push({
      label: g.era,
      from: reelBuilds.length,
      to: reelBuilds.length + g.projects.length,
    });
    for (const p of g.projects) {
      const label = eraLabel(p.era);
      const year = String(p.year ?? label);
      const entry = entries.get(p.id);
      reelBuilds.push({
        id: p.id,
        name: pick(locale, splitTitle(p.title)),
        year,
        era: label === year ? null : label,
        award: p.award && pick(locale, p.award),
        tags: displayTags((tags.get(p.id) ?? []).filter((t) => !common.has(t)), 3).map((tag) => pick(locale, tag)),
        body: entry?.html,
        lang: entry && entry.lang !== locale ? entry.lang : undefined,
        team: entry?.team,
        photos: entry?.photos,
        videos: entry?.videos,
        tile: tileFor(p, look),
      });
    }
  }
  const atIndex = reelBuilds.findIndex((b) => b.id === at);
  const archiveMarks: Mark[] = reelBuilds.map((b, i) => {
    const group = reelGroups.find((g) => i >= g.from && i < g.to);
    const first = group?.from === i;
    return {
      id: b.id,
      year: Number.parseInt(b.year, 10),
      first,
      targetId:
        first && group?.label
          ? `feed-era-${group.label.replace("–", "-")}`
          : `b-${b.id}`,
    };
  });

  const reel = phone ? null : (
    <ArchiveReel
      builds={reelBuilds}
      groups={reelGroups}
      start={Math.max(0, atIndex)}
      jump={atIndex >= 0}
      query={base(era, sort, look)}
      back={href(era, "depth", sort, look)}
    />
  );

  const field = (
    <ArchiveField
      locale={locale}
      groups={groups}
      teamSize={teamSize}
      sort={sort}
      look={look}
      eager={eager}
      reelHref={(id) => href(era, "reel", sort, look, id)}
    />
  );

  const entryOpen = view !== "list" && atIndex >= 0;
  const stepTo = (i: number) =>
    i >= 0 && i < reelBuilds.length
      ? { href: href(era, "reel", sort, look, reelBuilds[i].id), name: reelBuilds[i].name }
      : null;
  const phoneTree = entryOpen ? (
    <ArchiveEntry
      locale={locale}
      build={reelBuilds[atIndex]}
      close={`${href(era, "depth", sort, look)}#b-${reelBuilds[atIndex].id}`}
      prev={stepTo(atIndex - 1)}
      next={stepTo(atIndex + 1)}
    />
  ) : (
    <ArchiveGrid
      builds={reelBuilds}
      groups={reelGroups}
      open={(id) => href(era, "reel", sort, look, id)}
    />
  );

  const walk = (view === "depth" || view === "list") && era === null && sort === "year";
  const split = view !== "list";
  const feedWalk = era === null && sort === "year";

  const sortHref = Object.fromEntries(
    SORTS.map((key) => [key, href(era, view, key, look)]),
  ) as Record<Sort, string>;

  const first = Math.min(...all.map((p) => p.year ?? Number.parseInt(p.era, 10)));
  const last = Math.max(...all.map((p) => p.year ?? Number.parseInt(p.era.slice(-4), 10)));
  const span = `${first}–${last}`;

  return (
    <>
      <Navbar />
      <Suspense>
        <ArchiveTransitions />
      </Suspense>

      <div className="relative z-10 bg-canvas">
        <main id="main" className="u-square">
          <GridField className={`bg-canvas pb-section ${entryOpen ? "max-lg:pb-xl" : "max-lg:pb-[8rem]"}`}>
            <Container as="header" className={`page-opening ${entryOpen ? "page-cover--flush" : ""}`}>
              {entryOpen ? (
                <h1 className="sr-only lg:hidden">
                  {t.title}
                </h1>
              ) : null}
              <div
                className={`flex flex-wrap items-baseline justify-between gap-x-xl border-b border-rule pt-xl pb-sm text-body md:pt-xxl lg:grid lg:grid-cols-12 lg:gap-x-gutter min-[90rem]:text-title ${
                  entryOpen ? "max-lg:hidden" : ""
                }`}
              >
                <h1 className="flex shrink-0 items-baseline gap-x-sm text-ink lg:col-span-3">
                  {t.title}
                  <span className="tabular-nums text-ink-muted">{span}</span>
                </h1>

                <nav
                  aria-label={t.eraNav}
                  className={`max-lg:order-last max-lg:w-full max-lg:min-w-0 lg:col-start-4 lg:col-end-13 lg:row-start-1 ${feedWalk ? "max-lg:hidden" : ""}`}
                >
                  <ul className="u-scroll-x flex items-baseline gap-x-md whitespace-nowrap lg:gap-x-sm xl:gap-x-md max-lg:overflow-x-auto max-lg:pr-10 max-lg:[mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)] lg:flex-wrap">
                    <li className="shrink-0">
                      <Link
                        href={href(null, view, sort, look)}
                        data-vt
                        aria-current={era === null ? "page" : undefined}
                        className={`relative before:absolute before:inset-x-[-0.25rem] before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] lg:before:hidden flex min-w-[1.5rem] items-baseline lg:min-w-0 ${era === null ? ON : OFF}`}
                      >
                        {t.all}
                      </Link>
                    </li>
                    {NEWEST.map((e) => {
                      const walkTo = (id: string, show: string) => (
                        <a href={`#${id}`} className={`relative before:absolute before:inset-x-[-0.25rem] before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] lg:before:hidden items-baseline tabular-nums ${show} ${OFF}`}>
                          {e.label}
                        </a>
                      );
                      const filter = (show: string) => (
                        <Link
                          href={href(e.key, view, sort, look)}
                          data-vt
                          aria-current={era === e.key ? "page" : undefined}
                          className={`relative before:absolute before:inset-x-[-0.25rem] before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] lg:before:hidden items-baseline tabular-nums ${show} ${era === e.key ? ON : OFF}`}
                        >
                          {e.label}
                        </Link>
                      );
                      return (
                        <li key={e.key} className="shrink-0">
                          {!split ? (
                            walk ? walkTo(`era-${e.label}`, "flex") : filter("flex")
                          ) : !walk && !feedWalk ? (
                            filter("flex")
                          ) : (
                            <>
                              {walk ? walkTo(`era-${e.label}`, "hidden lg:flex") : filter("hidden lg:flex")}
                              {feedWalk
                                ? walkTo(`feed-era-${e.label}`, "flex lg:hidden")
                                : filter("flex lg:hidden")}
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="flex shrink-0 items-baseline gap-x-xl lg:col-start-4 lg:col-end-13 lg:row-start-1 lg:gap-x-md lg:justify-self-end xl:gap-x-xl">
                  <nav
                    aria-label={t.sortNav}
                    className={`flex items-baseline gap-x-md lg:gap-x-sm xl:gap-x-md max-lg:hidden ${view === "list" ? "lg:hidden" : ""}`}
                  >
                    {SORTS.map((key) => (
                      <Link
                        key={key}
                        href={sortHref[key]}
                        data-vt
                        aria-current={sort === key ? "page" : undefined}
                        className={sort === key ? ON : OFF}
                      >
                        {t.sorts[key]}
                      </Link>
                    ))}
                  </nav>
                  <nav aria-label={t.viewNav} className="flex items-baseline gap-x-md lg:gap-x-sm xl:gap-x-md">
                    {VIEWS.map((key) => {
                      const on = view === key;
                      const touchOn = on || (key === "depth" && view === "reel");
                      return (
                        <Link
                          key={key}
                          href={href(era, key, sort, look)}
                          data-vt
                          aria-current={on ? "page" : undefined}
                          className={`relative before:absolute before:inset-x-[-0.25rem] before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] lg:before:hidden items-baseline ${
                            key === "reel" ? "hidden lg:flex" : "flex"
                          } ${touchOn ? "text-ink" : "text-ink-muted"} ${
                            on ? "lg:text-ink" : "transition-colors lg:text-ink-muted lg:hover:text-ink"
                          }`}
                        >
                          {key === "depth" ? (
                            <>
                              <span className="lg:hidden">
                                {t.views.grid}
                              </span>
                              <span className="max-lg:hidden">
                                {t.views.depth}
                              </span>
                            </>
                          ) : (
                            t.views[key]
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </Container>

            <div className={`mt-lg lg:mt-xl ${entryOpen ? "max-lg:mt-0" : ""}`}>
              {view === "list" ? (
                <ArchiveCatalogue
                  locale={locale}
                  groups={groups}
                  tags={tags}
                  teamSize={teamSize}
                  sort={sort}
                  sortHref={sortHref}
                  look={look}
                  reelHref={(id) => href(era, "reel", sort, look, id)}
                />
              ) : phone ? (
                phoneTree
              ) : (
                <>
                  <div className="hidden lg:block">{view === "reel" ? reel : field}</div>
                  <div className="lg:hidden">{phoneTree}</div>
                </>
              )}
            </div>
          </GridField>

          {!entryOpen ? <AddBuild locale={locale} /> : null}

          {view === "list" || !entryOpen ? (
            <YearRuler
              actionId="archive-action"
              marks={view === "list" ? archiveMarks.map((m) => ({ ...m, targetId: `l-${m.id}` })) : archiveMarks}
              ariaLabel={t.ruler}
            />
          ) : null}
        </main>

        <Footer />
      </div>
    </>
  );
}

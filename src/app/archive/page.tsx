import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Container, GridField } from "@/components/ui";
import { T } from "@/components/T";
import {
  getArchiveWithMedia,
  parseEra,
  parseSort,
  sortArchive,
  type Sort,
} from "@/features/archive/api/getArchive";
import ArchiveDepth from "@/features/archive/components/ArchiveDepth";
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
import { ERAS, type ArchiveProject, type Bilingual, type Era } from "@/features/archive/types";
import { getEntries } from "@/features/archive/api/getEntries";
import { getIndex } from "@/features/content/api/getContent";
import YearRuler, { type Mark } from "@/features/history/components/YearRuler";
import AddBuild from "@/features/archive/components/AddBuild";

export const metadata: Metadata = {
  title: "Archive",
  description: "Every machine Sigma Intelligence has on record, 2007–2025.",
};

const ON = "text-ink";
const OFF = "text-ink-subtle transition-colors hover:text-ink";

/** Newest first: the page opens on the builds that were photographed best. */
const NEWEST = [...ERAS].reverse();

type View = "depth" | "reel" | "list";

/** The address without the view — era, sort and look — as a query string. */
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

const SORTS: { key: Sort; label: Bilingual }[] = [
  { key: "year", label: { en: "Year", ko: "연도순" } },
  { key: "team", label: { en: "Team size", ko: "팀 규모순" } },
  { key: "name", label: { en: "Name", ko: "이름순" } },
];

const VIEWS: { key: View; label: Bilingual }[] = [
  { key: "depth", label: { en: "Field", ko: "펼쳐 보기" } },
  { key: "reel", label: { en: "Reel", ko: "하나씩 보기" } },
  { key: "list", label: { en: "List", ko: "목록으로 보기" } },
];

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{
    era?: string;
    view?: string;
    sort?: string;
    look?: string;
    at?: string;
  }>;
}) {
  const {
    era: eraParam,
    view: viewParam,
    sort: sortParam,
    look: lookParam,
    at,
  } = await searchParams;
  // `?look=` switches the builds' treatment (cutout, drawing, pen, duotone, photo).
  const look = parseLook(lookParam);
  const era = parseEra(eraParam);
  const view: View = viewParam === "list" || viewParam === "reel" ? viewParam : "depth";
  const sort = parseSort(sortParam);

  const [all, entries, docs] = await Promise.all([
    getArchiveWithMedia(),
    getEntries(),
    getIndex("archive"),
  ]);
  const teamSize = new Map(
    docs.filter((d) => d.team.length > 0).map((d) => [d.slug, d.team.length]),
  );
  const tags = new Map(docs.map((d) => [d.slug, d.tags]));
  const filtered = era ? all.filter((p) => p.era === era) : all;
  const sorted = sortArchive(filtered, sort, teamSize);

  // By year the index is told in eras, newest first, each led by its year; by team size or
  // name it is one run. Within an era the hand order of projects.ts stands.
  const groups: { era: Bilingual | null; projects: ArchiveProject[] }[] =
    sort === "year"
      ? NEWEST.map((e) => ({
          era: e.label,
          projects: sorted.filter((p) => p.era === e.key),
        })).filter((g) => g.projects.length > 0)
      : [{ era: null, projects: sorted }];

  // The reel carries every build it can show, in the order shown, with what its detail needs.
  const reelBuilds: ReelBuild[] = [];
  const reelGroups: ReelGroup[] = [];
  for (const g of groups) {
    const common = commonTags(g.projects, tags);
    reelGroups.push({
      label: g.era?.en ?? null,
      from: reelBuilds.length,
      to: reelBuilds.length + g.projects.length,
    });
    for (const p of g.projects) {
      const year = String(p.year ?? p.era.replace("-", "–"));
      const eraLabel = p.era.replace("-", "–");
      const entry = entries.get(p.id);
      reelBuilds.push({
        id: p.id,
        name: splitTitle(p.title),
        year,
        era: eraLabel === year ? null : eraLabel,
        award: p.award,
        tags: displayTags((tags.get(p.id) ?? []).filter((t) => !common.has(t)), 3),
        body: entry?.html,
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

  // a phone UA gets the phone tree only; otherwise both trees ship and CSS picks
  const ua = await headers();
  const phone =
    ua.get("sec-ch-ua-mobile") === "?1" || /Mobi/i.test(ua.get("user-agent") ?? "");

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
    <ArchiveDepth
      groups={groups}
      tags={tags}
      teamSize={teamSize}
      look={look}
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

  // On the field and in the catalogue a year is a place on the page, not a filter: pressing it
  // walks the record to that era instead of cutting the rest of it away.
  const walk = (view === "depth" || view === "list") && era === null && sort === "year";
  // field and feed are separate trees with separate era ids
  const split = view !== "list";
  const feedWalk = era === null && sort === "year";

  const sortHref = Object.fromEntries(
    SORTS.map((s) => [s.key, href(era, view, s.key, look)]),
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
        <main id="main">
          <GridField className="bg-canvas pb-section max-lg:pb-[8rem]">
            <Container as="header" className={`page-opening ${entryOpen ? "page-cover--flush" : ""}`}>
              {entryOpen ? (
                <h1 className="sr-only lg:hidden">
                  <T en="Archive" ko="아카이브" />
                </h1>
              ) : null}
              <div
                className={`flex flex-wrap items-baseline justify-between gap-x-xl border-b lg:gap-x-lg xl:gap-x-xl border-rule pt-xl pb-sm text-body md:pt-xxl lg:flex-nowrap xl:text-title ${
                  entryOpen ? "max-lg:hidden" : ""
                }`}
              >
                <h1 className="flex min-h-11 shrink-0 items-baseline gap-x-sm text-ink lg:min-h-0">
                  <T en="Archive" ko="아카이브" />
                  <span className="tabular-nums text-ink-subtle">{span}</span>
                </h1>

                <nav
                  aria-label="Era"
                  className={`max-lg:order-last max-lg:w-full max-lg:min-w-0 lg:flex-1 ${feedWalk ? "max-lg:hidden" : ""}`}
                >
                  <ul className="u-scroll-x flex items-baseline gap-x-md whitespace-nowrap lg:gap-x-sm xl:gap-x-md max-lg:overflow-x-auto max-lg:pr-10 max-lg:[mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)] lg:flex-wrap">
                    <li className="shrink-0">
                      <Link
                        href={href(null, view, sort, look)}
                        data-vt
                        aria-current={era === null ? "page" : undefined}
                        className={`flex min-h-11 min-w-[1.5rem] items-baseline lg:min-h-0 lg:min-w-0 ${era === null ? ON : OFF}`}
                      >
                        <T en="All" ko="전체" />
                      </Link>
                    </li>
                    {NEWEST.map((e) => {
                      const walkTo = (id: string, show: string) => (
                        <a href={`#${id}`} className={`min-h-11 items-baseline tabular-nums lg:min-h-0 ${show} ${OFF}`}>
                          {e.label.en}
                        </a>
                      );
                      const filter = (show: string) => (
                        <Link
                          href={href(e.key, view, sort, look)}
                          data-vt
                          aria-current={era === e.key ? "page" : undefined}
                          className={`min-h-11 items-baseline tabular-nums lg:min-h-0 ${show} ${era === e.key ? ON : OFF}`}
                        >
                          {e.label.en}
                        </Link>
                      );
                      return (
                        <li key={e.key} className="shrink-0">
                          {!split ? (
                            walk ? walkTo(`era-${e.key}`, "flex") : filter("flex")
                          ) : !walk && !feedWalk ? (
                            filter("flex")
                          ) : (
                            <>
                              {walk ? walkTo(`era-${e.key}`, "hidden lg:flex") : filter("hidden lg:flex")}
                              {feedWalk
                                ? walkTo(`feed-era-${e.key}`, "flex lg:hidden")
                                : filter("flex lg:hidden")}
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="flex shrink-0 items-baseline gap-x-xl lg:gap-x-lg xl:gap-x-xl">
                  <nav
                    aria-label="Sort"
                    className={`flex items-baseline gap-x-md lg:gap-x-sm xl:gap-x-md max-lg:hidden ${view === "list" ? "lg:hidden" : ""}`}
                  >
                    {SORTS.map((s) => (
                      <Link
                        key={s.key}
                        href={sortHref[s.key]}
                        data-vt
                        aria-current={sort === s.key ? "page" : undefined}
                        className={sort === s.key ? ON : OFF}
                      >
                        <T en={s.label.en} ko={s.label.ko} />
                      </Link>
                    ))}
                  </nav>
                  <nav aria-label="View" className="flex items-baseline gap-x-md lg:gap-x-sm xl:gap-x-md">
                    {VIEWS.map((v) => {
                      const on = view === v.key;
                      const touchOn = on || (v.key === "depth" && view === "reel");
                      return (
                        <Link
                          key={v.key}
                          href={href(era, v.key, sort, look)}
                          data-vt
                          aria-current={on ? "page" : undefined}
                          className={`min-h-11 items-baseline lg:min-h-0 ${
                            v.key === "reel" ? "hidden lg:flex" : "flex"
                          } ${touchOn ? "text-ink" : "text-ink-subtle"} ${
                            on ? "lg:text-ink" : "transition-colors lg:text-ink-subtle lg:hover:text-ink"
                          }`}
                        >
                          {v.key === "depth" ? (
                            <>
                              <span className="lg:hidden">
                                <T en="Grid" ko="그리드" />
                              </span>
                              <span className="max-lg:hidden">
                                <T en={v.label.en} ko={v.label.ko} />
                              </span>
                            </>
                          ) : (
                            <T en={v.label.en} ko={v.label.ko} />
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

          {!entryOpen ? <AddBuild /> : null}

          {view === "list" || !entryOpen ? (
            <YearRuler
              marks={view === "list" ? archiveMarks.map((m) => ({ ...m, targetId: `l-${m.id}` })) : archiveMarks}
              ariaLabel="Archive builds, entry by entry"
            />
          ) : null}
        </main>

        <Footer />
      </div>
    </>
  );
}

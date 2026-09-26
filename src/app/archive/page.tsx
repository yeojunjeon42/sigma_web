import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
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
import { ERAS, type ArchiveProject, type Era } from "@/features/archive/types";
import { getEntries } from "@/features/archive/api/getEntries";
import { getIndex } from "@/features/content/api/getContent";
import YearRuler, { type Mark } from "@/features/history/components/YearRuler";
import AddBuild from "@/features/archive/components/AddBuild";

export const metadata: Metadata = {
  title: "Archive",
  description: "Every machine Sigma Intelligence has on record, 2007–2025.",
};

const ON = "text-ink";
const OFF = "text-ink-muted transition-colors hover:text-ink";

const NEWEST = [...ERAS].reverse();

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

const SORTS: { key: Sort; label: string }[] = [
  { key: "year", label: "Year" },
  { key: "team", label: "Team size" },
  { key: "name", label: "Name" },
];

const VIEWS: { key: View; label: string }[] = [
  { key: "depth", label: "Field" },
  { key: "reel", label: "Reel" },
  { key: "list", label: "List" },
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
      const year = String(p.year ?? p.era.replace("-", "–"));
      const eraLabel = p.era.replace("-", "–");
      const entry = entries.get(p.id);
      reelBuilds.push({
        id: p.id,
        name: splitTitle(p.title).en,
        year,
        era: eraLabel === year ? null : eraLabel,
        award: p.award?.en,
        tags: displayTags((tags.get(p.id) ?? []).filter((t) => !common.has(t)), 3).map((t) => t.en),
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

  const walk = (view === "depth" || view === "list") && era === null && sort === "year";
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
                  Archive
                </h1>
              ) : null}
              <div
                className={`flex flex-wrap items-baseline justify-between gap-x-xl border-b lg:gap-x-lg xl:gap-x-xl border-rule pt-xl pb-sm text-body md:pt-xxl lg:flex-nowrap xl:text-title ${
                  entryOpen ? "max-lg:hidden" : ""
                }`}
              >
                <h1 className="flex shrink-0 items-baseline gap-x-sm text-ink">
                  Archive
                  <span className="tabular-nums text-ink-muted">{span}</span>
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
                        className={`relative before:absolute before:inset-x-[-0.25rem] before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] lg:before:hidden flex min-w-[1.5rem] items-baseline lg:min-w-0 ${era === null ? ON : OFF}`}
                      >
                        All
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
                        {s.label}
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
                          className={`relative before:absolute before:inset-x-[-0.25rem] before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] lg:before:hidden items-baseline ${
                            v.key === "reel" ? "hidden lg:flex" : "flex"
                          } ${touchOn ? "text-ink" : "text-ink-muted"} ${
                            on ? "lg:text-ink" : "transition-colors lg:text-ink-muted lg:hover:text-ink"
                          }`}
                        >
                          {v.key === "depth" ? (
                            <>
                              <span className="lg:hidden">
                                Grid
                              </span>
                              <span className="max-lg:hidden">
                                {v.label}
                              </span>
                            </>
                          ) : (
                            v.label
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

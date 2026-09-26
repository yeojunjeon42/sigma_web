import type { Metadata } from "next";
import HeroField from "@/components/ui/HeroField";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Container, GridField, Reveal } from "@/components/ui";
import { getSponsors } from "@/features/sponsors/api/getSponsors";
import { getArchiveWithMedia } from "@/features/archive/api/getArchive";
import { HERO_BUILDS } from "@/features/archive/data/hero";
import { splitTitle } from "@/features/archive/components/splitTitle";
import looks from "@/features/archive/data/looks.json";
import RecordLines from "@/features/site/components/RecordLines";
import { CountUp } from "@/components/ui/CountUp";
import { getAwards } from "@/features/awards/api/getAwards";
import { ALUMNI_TOTAL, getCohorts } from "@/features/alumni/api/getCohorts";
import { CURRICULUM, EQUIPMENT } from "@/features/site/data/about";

const FOUNDED = 1984;
const FIGURE = "block text-[clamp(8rem,44vw,22rem)] leading-[0.8] tracking-[-0.055em] tabular-nums md:text-[clamp(8rem,24vw,22rem)]";
const LIST = "text-title text-ink [&>li+li]:mt-xxs";

export const metadata: Metadata = {
  description:
    "Korea's first university robotics club, founded 1984 at Seoul National University.",
};

export default async function Home() {
  const [sponsors, builds, awards, cohorts] = await Promise.all([
    getSponsors(),
    getArchiveWithMedia(),
    getAwards(),
    getCohorts(),
  ]);

  const years = new Date().getFullYear() - FOUNDED;

  const plates = HERO_BUILDS.flatMap((id) => {
    const p = builds.find((x) => x.id === id);
    return p
      ? [{ id, src: `/archive-looks/${id}/cutout.webp`, name: splitTitle(p.title).en, year: p.year }]
      : [];
  });

  const line = [...builds].reverse().map((p) => ({
    id: p.id,
    name: splitTitle(p.title).en,
    year: p.year,
    src: p.id in looks ? `/archive-looks/${p.id}/cutout.webp` : null,
  }));

  const merged = new Map<string, { year: number; contest: typeof awards[number]["contest"]; got: typeof awards[number]["result"][] }>();
  for (const a of awards) {
    const key = `${a.year}|${a.contest.en}`;
    const row = merged.get(key);
    if (row) row.got.push(a.result);
    else merged.set(key, { year: a.year, contest: a.contest, got: [a.result] });
  }
  const tally = (got: { en: string }[]) => {
    const n = new Map<string, number>();
    for (const r of got) n.set(r.en, (n.get(r.en) ?? 0) + 1);
    return [...n].map(([k, c]) => (c > 1 ? `${k} ×${c}` : k)).join(", ");
  };
  const results = [...merged].map(([key, r]) => ({
    key,
    year: r.year,
    contest: r.contest.en,
    result: tally(r.got),
  }));

  return (
    <>
      <Navbar />

      <div className="relative z-10 bg-canvas">
        <HeroField sponsors={sponsors} builds={plates} />

      <main id="main">
        <section
          aria-label="Founded 1984"
          className="bg-band text-ink"
        >
          <Container className="grid gap-y-xl py-xxl md:grid-cols-12 md:items-end md:py-section">
            <p className="md:col-span-8">
              <span className="text-body text-ink-muted">
                Founded
              </span>
              <span className={`${FIGURE} u-drift mt-sm [--drift-from:32px] [--drift-to:-32px]`}><CountUp from={new Date().getFullYear()} to={FOUNDED} /></span>
            </p>
            <p className="text-right md:col-span-4">
              <span className="text-body text-ink-muted">
                Years
              </span>
              <span className={`${FIGURE} u-drift mt-sm [--drift-from:32px] [--drift-to:-32px]`}><CountUp to={years} /></span>
            </p>
          </Container>
        </section>

        <GridField className="bg-canvas pb-section">
          <Container className="pt-xxxl">
            <RecordLines
              builds={line}
              results={results}
              total={awards.length}
              cohorts={cohorts.length}
              people={ALUMNI_TOTAL}
            />

            <Reveal
              className="mt-section grid grid-cols-2 gap-x-lg gap-y-xxl md:grid-cols-12 md:gap-y-section lg:mt-section-lg"
              stagger={70}
            >
              <h2 className="text-title text-ink md:col-span-3 md:row-start-1">
                Stacks
              </h2>
              <ul className={`${LIST} md:col-span-3 md:col-start-4 md:row-start-1`}>
                {CURRICULUM.map((c) => (
                  <li key={c.en} className="u-scroll-in">
                    {c.href ? (
                      <a
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="u-swipe relative before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 lg:before:hidden"
                      >
                        {c.en}
                      </a>
                    ) : (
                      c.en
                    )}
                  </li>
                ))}
              </ul>

              <h2 className="text-title text-ink md:col-span-3 md:col-start-7 md:row-start-2">
                Equipments
              </h2>
              <ul className={`${LIST} md:col-span-3 md:col-start-10 md:row-start-2`}>
                {EQUIPMENT.map((e) => (
                  <li key={e.en} className="u-scroll-in">
                    {e.en}
                  </li>
                ))}
              </ul>

              <h2 className="text-title text-ink md:col-span-3 md:col-start-3 md:row-start-3">
                Intake
              </h2>
              <ul className={`${LIST} md:col-span-3 md:col-start-6 md:row-start-3`}>
                <li>
                  March
                </li>
                <li>
                  September
                </li>
              </ul>
            </Reveal>
          </Container>
        </GridField>
      </main>

      <Footer />
      </div>
    </>
  );
}

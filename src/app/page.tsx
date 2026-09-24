import type { Metadata } from "next";
import HeroField from "@/components/ui/HeroField";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { T } from "@/components/T";
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
      ? [{ id, src: `/archive-looks/${id}/cutout.webp`, name: splitTitle(p.title), year: p.year }]
      : [];
  });

  const line = [...builds].reverse().map((p) => ({
    id: p.id,
    name: splitTitle(p.title),
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
  const tally = (got: { en: string; ko: string }[], lang: "en" | "ko") => {
    const n = new Map<string, number>();
    for (const r of got) n.set(r[lang], (n.get(r[lang]) ?? 0) + 1);
    return [...n].map(([k, c]) => (c > 1 ? `${k} ×${c}` : k)).join(", ");
  };
  const results = [...merged].map(([key, r]) => ({
    key,
    year: r.year,
    contest: r.contest,
    result: { en: tally(r.got, "en"), ko: tally(r.got, "ko") },
  }));

  return (
    <>
      <Navbar />

      {/* The room takes the first viewport; the masthead composition is the first
          block to slide up over it. */}
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
                <T en="Founded" ko="창립" />
              </span>
              <span className={`${FIGURE} u-drift mt-sm [--drift-from:32px] [--drift-to:-32px]`}><CountUp from={new Date().getFullYear()} to={FOUNDED} /></span>
            </p>
            <p className="text-right md:col-span-4">
              <span className="text-body text-ink-muted">
                <T en="Years" ko="년" />
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
                <T en="Stacks" ko="스택" />
              </h2>
              <ul className={`${LIST} md:col-span-3 md:col-start-4 md:row-start-1`}>
                {CURRICULUM.map((c) => (
                  <li key={c.en} className="u-scroll-in">
                    {c.href ? (
                      <a
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative transition-opacity before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 hover:opacity-60 lg:before:hidden"
                      >
                        <T en={c.en} ko={c.ko} />
                      </a>
                    ) : (
                      <T en={c.en} ko={c.ko} />
                    )}
                  </li>
                ))}
              </ul>

              <h2 className="text-title text-ink md:col-span-3 md:col-start-7 md:row-start-2">
                <T en="Equipments" ko="장비" />
              </h2>
              <ul className={`${LIST} md:col-span-3 md:col-start-10 md:row-start-2`}>
                {EQUIPMENT.map((e) => (
                  <li key={e.en} className="u-scroll-in">
                    <T en={e.en} ko={e.ko} />
                  </li>
                ))}
              </ul>

              <h2 className="text-title text-ink md:col-span-3 md:col-start-3 md:row-start-3">
                <T en="Intake" ko="모집" />
              </h2>
              <ul className={`${LIST} md:col-span-3 md:col-start-6 md:row-start-3`}>
                <li>
                  <T en="March" ko="3월" />
                </li>
                <li>
                  <T en="September" ko="9월" />
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

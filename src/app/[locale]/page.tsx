import { pick } from "@/i18n/config";
import { HOME } from "@/i18n/dict/home";
import { META } from "@/i18n/dict/meta";
import { localeOf, type PageProps } from "@/i18n/server";
import type { Metadata } from "next";
import { share } from "@/app/share";
import HeroField from "@/components/ui/HeroField";
import Navbar from "@/components/Navbar";
import DotThread from "@/components/DotThread";
import Footer from "@/components/Footer";
import { Container, GridField, Reveal } from "@/components/ui";
import { getCofounded, getSponsors } from "@/features/sponsors/api/getSponsors";
import { getArchiveWithMedia } from "@/features/archive/api/getArchive";
import { HERO_BUILDS } from "@/features/archive/data/hero";
import { splitTitle } from "@/features/archive/components/splitTitle";
import { objectSrc } from "@/features/archive/data/field";
import RecordLines from "@/features/site/components/RecordLines";
import SupportBand from "@/features/sponsors/components/SupportBand";
import { CountUp } from "@/components/ui/CountUp";
import { getAwards } from "@/features/awards/api/getAwards";
import { ALUMNI_TOTAL, COHORT_COUNT } from "@/features/alumni/data/cohorts";
import { CURRICULUM, EQUIPMENT } from "@/features/site/data/about";

const FOUNDED = 1984;
const FIGURE = "block font-[family-name:var(--f-display)] font-bold [font-stretch:125%] text-[calc((100vw-2*var(--gutter))/2.85)] leading-[0.8] tracking-[-0.02em] tabular-nums md:text-[min(21vw,19rem)]";
const LIST = "text-title text-ink max-[359px]:text-lead [&>li+li]:mt-xxs";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await localeOf(params);
  const { title, description } = META[locale].home;
  return { title: { absolute: title }, description, ...share(locale, "/", { description }) };
}

export default async function Home({ params }: PageProps) {
  const locale = await localeOf(params);
  const t = HOME[locale];
  const [sponsors, cofounded, builds, awards] = await Promise.all([
    getSponsors(),
    getCofounded(),
    getArchiveWithMedia(),
    getAwards(),
  ]);

  const years = new Date().getFullYear() - FOUNDED;

  const plates = HERO_BUILDS.flatMap((id) => {
    const p = builds.find((x) => x.id === id);
    const src = objectSrc(id);
    return p && src ? [{ id, src, name: pick(locale, splitTitle(p.title)), year: p.year }] : [];
  });

  const line = builds.toReversed().map((p) => ({
    id: p.id,
    name: pick(locale, splitTitle(p.title)),
    year: p.year,
    src: objectSrc(p.id),
  }));

  return (
    <>
      <Navbar />

      <div className="relative z-10 bg-canvas">
        <HeroField locale={locale} sponsors={sponsors} cofounded={cofounded} builds={plates} />
        <DotThread builds={plates} />

      <main id="main">
        <SupportBand sponsors={sponsors} cofounded={cofounded} />

        <section
          aria-label={t.foundedIn(FOUNDED)}
          data-thread="founded"
          className="bg-band text-ink"
        >
          <Container className="grid gap-y-xl py-xxl md:grid-cols-12 md:items-end md:gap-x-gutter md:py-section">
            <p className="u-drift [--drift-from:32px] [--drift-to:-32px] md:col-span-8">
              <span className="text-body text-ink">
                {t.founded}
              </span>
              <span className={`${FIGURE} mt-sm -ml-[0.108em]`}><CountUp from={new Date().getFullYear()} to={FOUNDED} /></span>
            </p>
            <p data-offgrid className="u-drift [--drift-from:32px] [--drift-to:-32px] text-right md:col-span-4">
              <span className="text-body text-ink">
                {t.years}
              </span>
              <span className={`${FIGURE} mt-sm -mr-[0.029em]`}><CountUp to={years} /></span>
            </p>
          </Container>
        </section>

        <GridField className="bg-canvas pb-section">
          <Container className="pt-xxxl">
            <RecordLines
              builds={line}
              total={awards.length}
              cohorts={COHORT_COUNT}
              people={ALUMNI_TOTAL}
            />

            <Reveal
              className="mt-section grid grid-cols-2 gap-x-gutter gap-y-xxl md:grid-cols-12 md:gap-y-section lg:mt-section-lg"
              stagger={70}
            >
              <h2 data-thread="stacks" className="text-title text-ink md:col-span-3 md:row-start-1">
                {t.stacks}
              </h2>
              <ul className={`${LIST} md:col-span-3 md:col-start-4 md:row-start-1`}>
                {CURRICULUM.map((c) => (
                  <li key={c.en} className="u-scroll-in">
                    {c.href ? (
                      <a
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="u-swipe relative before:absolute before:-inset-x-1 before:top-1/2 before:h-11 before:-translate-y-1/2 lg:before:hidden"
                      >
                        {pick(locale, c)}
                      </a>
                    ) : (
                      pick(locale, c)
                    )}
                  </li>
                ))}
              </ul>

              <h2 data-thread="equipments" className="text-title text-ink md:col-span-3 md:col-start-7 md:row-start-2">
                {t.equipments}
              </h2>
              <ul className={`${LIST} md:col-span-3 md:col-start-10 md:row-start-2`}>
                {EQUIPMENT.map((e) => (
                  <li key={e.en} className="u-scroll-in">
                    {pick(locale, e)}
                  </li>
                ))}
              </ul>

              <h2 data-thread="intake" className="text-title text-ink md:col-span-3 md:col-start-3 md:row-start-3">
                {t.intake}
              </h2>
              <ul className={`${LIST} md:col-span-3 md:col-start-6 md:row-start-3`}>
                <li>
                  {t.months[0]}
                </li>
                <li>
                  {t.months[1]}
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

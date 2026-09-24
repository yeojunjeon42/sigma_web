import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Container, GridField } from "@/components/ui";
import { getTimeline } from "@/features/history/api/getTimeline";
import Chronology from "@/features/history/components/Chronology";
import YearRuler, { type Mark } from "@/features/history/components/YearRuler";
import HistoryHero from "@/features/history/components/HistoryHero";
import Collage from "@/features/history/components/Collage";
import { CLUB_EVENTS, HERO_PHOTO } from "@/features/history/data/photos";
import { ALUMNI_TOTAL, COHORTS } from "@/features/alumni/data/cohorts";

export const metadata: Metadata = {
  title: "History",
  description:
    "The dated record of Sigma Intelligence at Seoul National University — events and competition results, assembled from the club's own documents.",
};

export default async function ClubLifePage() {
  const nodes = await getTimeline();
  const marks: Mark[] = nodes.flatMap((n) =>
    n.events.map((e, i) => ({
      id: e.id,
      year: n.year,
      first: i === 0,
      targetId: i === 0 ? `y${n.year}` : `e-${e.id}`,
    })),
  );

  const latest = nodes[0];
  const now = [...latest.events].reverse().slice(0, 3);
  const facts = [
    { label: { en: "Cohorts", ko: "기수" }, value: { en: String(COHORTS.length), ko: `${COHORTS.length}기` } },
    { label: { en: "Members and alumni", ko: "회원 및 졸업생" }, value: { en: String(ALUMNI_TOTAL), ko: `${ALUMNI_TOTAL}명` } },
  ];

  return (
    <>
      <Navbar />

      <div className="relative z-10 bg-canvas">
        <main id="main">
          <GridField>
            <Container className="pb-section max-md:pb-[8rem]">
              <HistoryHero
                now={now}
                facts={facts}
                latest={latest.year}
                photo={HERO_PHOTO}
                event={CLUB_EVENTS[0]}
              />

              <div className="lg:grid lg:grid-cols-12 lg:gap-x-lg">
                <div id="ledger" className="lg:col-span-8 lg:self-start">
                  <Chronology nodes={nodes} />
                </div>
                <aside className="hidden lg:col-span-4 lg:block">
                  <Collage events={CLUB_EVENTS} />
                </aside>
              </div>
            </Container>
          </GridField>

          {/* Outside the sheet: the arrival animation puts a filter on each block of
              `GridField`, and a filtered ancestor would hold this to the page, not the screen. */}
          <YearRuler marks={marks} />
        </main>

        <Footer />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Container, GridField } from "@/components/ui";
import { generationLabel } from "@/features/alumni/api/getCohorts";
import { ALUMNI, alumnusGeneration } from "@/features/alumni/data/people";
import { getTeam } from "@/features/members/api/getMembers";
import AlumniPlates, { type Alumnus } from "@/features/members/components/AlumniPlates";
import MemberCrew, { type CrewMember } from "@/features/members/components/MemberCrew";
import { INCOMING, generationOf } from "@/features/members/data/roster";

const META = "text-caption tracking-normal";

export const metadata: Metadata = {
  title: "Members",
  description: "The students of Sigma Intelligence today.",
};

export default async function MembersPage() {
  const team = await getTeam();

  const ranked = team.filter((m) => m.role || m.incoming);
  const rest = team
    .filter((m) => !m.role && !m.incoming)
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
  const members: CrewMember[] = [...ranked, ...rest].map((m) => ({
    id: m.id,
    name: m.name,
    nameEn: m.nameEn,
    post: m.role ?? (m.duty ? undefined : INCOMING),
    duty: m.duty,
    department: m.department,
    gen: generationLabel(generationOf(m)),
    portrait: m.portrait,
    links: m.links,
  }));

  const alumni: Alumnus[] = [...ALUMNI]
    .sort((a, b) => a.entryYear - b.entryYear)
    .map((a) => ({
      id: a.id,
      name: a.name,
      field: a.field,
      gen: generationLabel(alumnusGeneration(a)),
      year: a.entryYear,
      portrait: null,
    }));

  return (
    <>
      <Navbar />

      <div className="relative z-10 bg-canvas">
        <main id="main">
          <GridField>
            <Container className="page-opening pb-section">
              <div className="u-scroll-in flex items-baseline pt-xl pb-sm text-body md:pt-xxl xl:text-title">
                <h1 className="flex items-baseline gap-x-sm text-ink">
                  Members
                  <span className="tabular-nums text-ink-muted">{new Date().getFullYear()}</span>
                </h1>
              </div>
              {members.length > 0 && <MemberCrew members={members} />}
            </Container>

            <Container className="pb-section">
              <section aria-labelledby="alumni">
                <h2 id="alumni" className={`u-scroll-in ${META} mb-lg text-ink`}>
                  Alumni
                </h2>
                {alumni.length > 0 ? (
                  <AlumniPlates alumni={alumni} />
                ) : (
                  <ul aria-hidden="true" className="grid grid-cols-2 gap-lg md:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                      <li key={i} className={`aspect-square bg-surface-sunken ${i > 1 ? "max-md:hidden" : ""}`} />
                    ))}
                  </ul>
                )}
              </section>
            </Container>
          </GridField>
        </main>

        <Footer />
      </div>
    </>
  );
}

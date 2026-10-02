import type { Metadata } from "next";
import { share } from "@/app/share";
import ContactPill from "@/components/ContactPill";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Container, GridField } from "@/components/ui";
import { ALUMNI } from "@/features/alumni/data/people";
import { getTeam } from "@/features/members/api/getMembers";
import MemberCrew, { type CrewMember } from "@/features/members/components/MemberCrew";
import { INCOMING } from "@/features/members/data/roster";
import { CREW_SAMPLES } from "@/features/members/data/samples";
import { SHOW_SAMPLES } from "@/features/content/data/samples";

const PLACEHOLDER_BIO = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

const DESCRIPTION = "The members and alumni of SIGMA INTELLIGENCE.";
const MEMBER_FORM = "https://forms.gle/o3uj9VwncYV3in9r6";
const PILL = "Update your member profile";

export const metadata: Metadata = {
  title: "Members",
  description: DESCRIPTION,
  ...share("/members", { title: "Members", description: DESCRIPTION }),
};

export default async function MembersPage() {
  const team = [...(await getTeam()), ...CREW_SAMPLES.map((m) => ({ ...m, portrait: null }))];

  const ranked = team.filter((m) => m.role || m.incoming);
  const rest = team
    .filter((m) => !m.role && !m.incoming)
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
  const members: CrewMember[] = [...ranked, ...rest].map((m) => ({
    id: m.id,
    name: m.name,
    group: m.role || m.incoming ? "executives" : "members",
    post: m.role ?? (m.incoming && !m.duty ? INCOMING : undefined),
    duty: m.duty,
    department: m.department,
    bio: m.bio ?? (SHOW_SAMPLES ? PLACEHOLDER_BIO : undefined),
    portrait: m.portrait,
    links: m.links,
  }));

  const alumni: CrewMember[] = [...ALUMNI]
    .sort((a, b) => a.entryYear - b.entryYear)
    .map((a) => ({
      id: a.id,
      group: "alumni",
      name: a.name,
      department: a.field,
      year: a.entryYear,
      portrait: null,
      bio: a.quote,
      links: a.links,
    }));
  const crew = [...alumni, ...members];

  return (
    <>
      <Navbar />

      <div className="relative z-10 bg-canvas">
        <main id="main">
          <GridField>
            <h1 className="sr-only">Members</h1>
            <Container className="page-opening pb-section">
              <section aria-labelledby="crew">
                <div className="u-scroll-in flex items-baseline pt-xl pb-sm text-body md:pt-xxl xl:text-title">
                  <h2 id="crew" className="flex items-baseline gap-x-sm text-ink">
                    Members
                    <span className="tabular-nums text-ink-muted">{new Date().getFullYear()}</span>
                  </h2>
                  <span className="ml-auto tabular-nums text-ink-muted">{crew.length}</span>
                </div>
                {crew.length > 0 && <MemberCrew members={crew} />}
              </section>
            </Container>
          </GridField>
          <ContactPill href={MEMBER_FORM} pill={PILL} showOnMobile />
        </main>

        <Footer />
      </div>
    </>
  );
}

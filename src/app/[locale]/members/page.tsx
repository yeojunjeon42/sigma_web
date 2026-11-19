import { META } from "@/i18n/dict/meta";
import { MEMBERS } from "@/i18n/dict/members";
import { localeOf, type PageProps } from "@/i18n/server";
import type { Metadata } from "next";
import { share } from "@/app/share";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Container, GridField } from "@/components/ui";
import { ALUMNI } from "@/features/alumni/data/people";
import { getTeam } from "@/features/members/api/getMembers";
import MemberCrew, { type CrewMember } from "@/features/members/components/MemberCrew";
import { INCOMING, MEMBER_COUNT } from "@/features/members/data/roster";

const MEMBER_FORM = "https://forms.gle/o3uj9VwncYV3in9r6";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await localeOf(params);
  const { title, description } = META[locale].members;
  return { title, description, ...share(locale, "/members", { title, description }) };
}

export default async function MembersPage({ params }: PageProps) {
  const locale = await localeOf(params);
  const team = await getTeam();

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
    bio: m.bio,
    portrait: m.portrait,
    links: m.links,
  }));

  const alumni: CrewMember[] = ALUMNI.toSorted((a, b) => a.entryYear - b.entryYear)
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
            <h1 className="sr-only">{MEMBERS[locale].title}</h1>
            <Container className="page-opening pb-section">
              <section aria-labelledby="crew">
                <div className="u-scroll-in flex items-baseline border-b border-rule pt-xl pb-sm text-body md:pt-xxl min-[90rem]:text-title">
                  <h2 id="crew" className="flex items-baseline gap-x-sm text-ink">
                    {MEMBERS[locale].title}
                    <span className="tabular-nums text-ink-muted">{new Date().getFullYear()}</span>
                  </h2>
                  <span className="ml-auto tabular-nums text-ink-muted">{alumni.length + MEMBER_COUNT}</span>
                </div>
                <MemberCrew members={crew} total={alumni.length + MEMBER_COUNT} form={MEMBER_FORM} />
              </section>
            </Container>
          </GridField>
        </main>

        <Footer />
      </div>
    </>
  );
}

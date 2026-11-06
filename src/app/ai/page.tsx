import type { Metadata } from "next";
import { ARCHIVE } from "@/features/archive/data/projects";
import { ARCHIVE_SPAN, AWARD_SPAN, AWARDS, ORG, PAGES, SITE, SOCIAL, getPosts, ALUMNI_TOTAL, COHORT_COUNT, FIRST_INTAKE, LAST_INTAKE } from "@/app/ai/corpus";
import { page } from "@/app/ai/ld";
import { Bil, DIM, Ext, Facts, Head, Ld, Section } from "@/app/ai/terminal";

const DESCRIPTION = `${new URL(SITE).host} as plain text, with a Markdown copy of every page.`;

export const metadata: Metadata = {
  title: { absolute: "Index \\ Terminal" },
  description: DESCRIPTION,
  alternates: { canonical: "/ai", types: { "text/markdown": "/ai/index.md" } },
};

export default function TerminalHome() {

  return (
    <>
      <Ld data={page("/ai", "SIGMA INTELLIGENCE", DESCRIPTION)} />
      <Head
        name="index"
        notes={["snusigma.net as plain text."]}
        md="/ai/index.md"
        human="/"
      />

      <Section id="about" title="About">
        <Facts
          rows={[
            { k: "Name", v: <Bil v={{ en: ORG.name, ko: ORG.nameKo }} /> },
            { k: "Type", v: "University robotics club" },
            { k: "Founded", v: <time dateTime={ORG.founded}>{ORG.founded}</time> },
            { k: "Institution", v: ORG.institution },
            { k: "Department", v: ORG.department.en },
            { k: "Club room", v: ORG.room.en },
            { k: "Email", v: <Ext href={`mailto:${ORG.email}`}>{ORG.email}</Ext> },
            { k: "Website", v: <Ext href={SITE} /> },
            {
              k: "Channels",
              v: SOCIAL.map((s, i) => (
                <span key={s.name}>
                  {i > 0 && ", "}
                  <Ext href={s.href}>{s.name}</Ext>
                </span>
              )),
            },
          ]}
        />
        <p className="mt-2">{ORG.summary}</p>
      </Section>

      <Section id="record" title="Record">
        <Facts
          rows={[
            { k: "Builds", v: `${ARCHIVE.length} (${ARCHIVE_SPAN})` },
            { k: "Awards", v: `${AWARDS.length} (${AWARD_SPAN})` },
            { k: "Cohorts", v: `${COHORT_COUNT} (${FIRST_INTAKE}–${LAST_INTAKE})` },
            { k: "Members and alumni", v: String(ALUMNI_TOTAL) },
            { k: "Posts", v: String(getPosts().length) },
          ]}
        />
      </Section>

      <Section id="pages" title="Pages">
        <Facts
          rows={PAGES.map((p) => ({
            k: p.title,
            v: (
              <>
                <Ext href={p.ai}>{p.ai}</Ext> <span className={DIM}># {p.note}</span>
              </>
            ),
          }))}
        />
      </Section>
    </>
  );
}

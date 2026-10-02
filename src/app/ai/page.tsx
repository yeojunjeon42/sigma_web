import type { Metadata } from "next";
import { ARCHIVE } from "@/features/archive/data/projects";
import { AWARDS, ORG, PAGES, SITE, SOCIAL, getHistory, getPosts, ALUMNI_TOTAL, COHORT_COUNT, FIRST_INTAKE, LAST_INTAKE } from "@/app/ai/corpus";
import { page } from "@/app/ai/ld";
import { Bil, DIM, Ext, Facts, Head, Items, Ld, Section } from "@/app/ai/terminal";

const DESCRIPTION =
  `Terminal view of ${new URL(SITE).host}: identity, key facts and every page, with Markdown twins.`;

export const metadata: Metadata = {
  title: { absolute: "Index \\ Terminal" },
  description: DESCRIPTION,
  alternates: { canonical: "/ai", types: { "text/markdown": "/ai/index.md" } },
};

export default async function TerminalHome() {
  const history = await getHistory();
  const entries = history.reduce((n, y) => n + y.entries.reduce((m, e) => m + e.count, 0), 0);
  const years = AWARDS.map((a) => a.year);
  const [first, last] = [Math.min(...years), Math.max(...years)];

  return (
    <>
      <Ld data={page("/ai", "SIGMA INTELLIGENCE — terminal", DESCRIPTION)} />
      <Head
        name="index"
        notes={["snusigma.net in plain text, for AI agents, search engines and anyone who wants just the facts."]}
        md="/ai/index.md"
        human="/"
      />

      <Section id="about" title="About">
        <Facts
          rows={[
            { k: "Name", v: <Bil v={{ en: ORG.name, ko: ORG.nameKo }} /> },
            { k: "Type", v: "University robotics club" },
            { k: "Founded", v: <time dateTime={ORG.founded}>{ORG.founded}</time> },
            { k: "Institution", v: <Bil v={{ en: ORG.institution, ko: ORG.institutionKo }} /> },
            { k: "Department", v: <Bil v={ORG.department} /> },
            { k: "Club room", v: <Bil v={ORG.room} /> },
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
        <p>
          Its archive holds {ARCHIVE.length} builds from 2007 to 2025. Recognition includes {AWARDS.length} awards from {first}{" "}
          to {last}.
        </p>
      </Section>

      <Section id="record" title="Record">
        <Facts
          rows={[
            { k: "Builds", v: `${ARCHIVE.length} (2007–2025)` },
            { k: "Awards", v: `${AWARDS.length} (${first}–${last})` },
            { k: "Timeline entries", v: String(entries) },
            { k: "Cohorts", v: `${COHORT_COUNT} (${FIRST_INTAKE}–${LAST_INTAKE})` },
            { k: "Members and alumni", v: String(ALUMNI_TOTAL) },
            { k: "Posts", v: String(getPosts().length) },
          ]}
        />
      </Section>

      <Section id="pages" title="Pages">
        <Items>
          {PAGES.map((p) => (
            <li key={p.key} id={`page-${p.key}`} className="scroll-mt-6">
              <Ext href={p.ai}>{p.title.toLowerCase()}</Ext> — {p.note} <span className={DIM}>({p.md})</span>
            </li>
          ))}
        </Items>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { getMembers } from "@/app/ai/corpus";
import { membersList, page } from "@/app/ai/ld";
import { DIM, Ext, Head, Items, Ld, Section } from "@/app/ai/terminal";

const DESCRIPTION = "The current executive team of Sigma Intelligence.";

export const metadata: Metadata = {
  title: "Members",
  description: DESCRIPTION,
  alternates: { canonical: "/ai/members", types: { "text/markdown": "/ai/members.md" } },
};

export default async function TerminalMembers() {
  const members = await getMembers();

  return (
    <>
      <Ld data={page("/ai/members", "Members — executive team", DESCRIPTION)} />
      <Ld data={membersList(members)} />
      <Head
        name="members"
        notes={[
          "the team behind SIGMA INTELLIGENCE this year.",
          "names in Korean, as the members write them.",
        ]}
        facts={[{ k: "Team", v: String(members.length) }]}
        md="/ai/members.md"
        human="/members"
      />

      <Section id="executives" title="Team">
        <Items>
          {members.map((m) => (
            <li key={m.id} id={m.id} className="scroll-mt-6">
              <span lang="ko">{m.name}</span> — {[m.role.en, m.duty?.en].filter(Boolean).join(", ")}
              {m.links.map(([k, v]) => (
                <span key={k}>
                  {" "}
                  <Ext href={k === "email" ? `mailto:${v}` : v}>{k}</Ext>
                </span>
              ))}
              <span lang="ko" className={`block ${DIM}`}>
                {[m.role.ko, m.duty?.ko].filter(Boolean).join(", ")} · {m.department.en}
              </span>
              {m.bio && <span className="block">&ldquo;{m.bio}&rdquo;</span>}
            </li>
          ))}
        </Items>
      </Section>
    </>
  );
}

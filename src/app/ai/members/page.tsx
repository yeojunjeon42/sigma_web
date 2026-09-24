import type { Metadata } from "next";
import { getMembers } from "@/app/ai/corpus";
import { membersList, page } from "@/app/ai/ld";
import { Bil, Ext, Head, Ld, Section, Table } from "@/app/ai/machine";

const DESCRIPTION = "The current executive team of Sigma Intelligence.";

export const metadata: Metadata = {
  title: "Members",
  description: DESCRIPTION,
  alternates: { canonical: "/ai/members", types: { "text/markdown": "/ai/members.md" } },
};

export default async function MachineMembers() {
  const members = await getMembers();

  return (
    <>
      <Ld data={page("/ai/members", "Members — executive team", DESCRIPTION)} />
      <Ld data={membersList(members)} />
      <Head
        title="Members — executive team"
        lede="Names are given in Korean, as the members write them, and are not romanised. 기수 is the cohort number counted from 1984; 학번 is the two-digit matriculation year. Only the executive team is published."
        md="/ai/members.md"
        human="/members"
      />

      <Section id="executives" title="Executive team">
        <Table
          caption="Executive team"
          head={["Name", "Role", "Also", "기수", "학번", "Department", "Links"]}
          wrap={[5]}
          rows={members.map((m) => ({
            id: m.id,
            cells: [
              <span key="n" lang="ko">
                {m.name}
              </span>,
              <Bil key="r" v={m.role} />,
              m.duty ? <Bil key="u" v={m.duty} /> : "",
              String(m.generation),
              m.cohort,
              <Bil key="d" v={m.department} />,
              m.links.map(([k, v], i) => (
                <span key={k}>
                  {i > 0 && " · "}
                  <Ext href={k === "email" ? `mailto:${v}` : v}>{k}</Ext>
                </span>
              )),
            ],
          }))}
        />
      </Section>
    </>
  );
}

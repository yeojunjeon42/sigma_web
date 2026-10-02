import fs from "node:fs";
import path from "node:path";
import { ARCHIVE } from "@/features/archive/data/projects";
import { ERAS } from "@/features/archive/types";
import { splitTitle } from "@/features/archive/components/splitTitle";
import { AWARDS } from "@/features/awards/data/awards";
import { ALUMNI_TOTAL, COHORT_COUNT, FIRST_INTAKE, LAST_INTAKE } from "@/features/alumni/data/cohorts";
import { getTimeline } from "@/features/history/api/getTimeline";
import { soleWork } from "@/features/history/data/works";
import { getTeam } from "@/features/members/api/getMembers";
import { INCOMING } from "@/features/members/data/roster";
import { CURRICULUM, EQUIPMENT, FACTS } from "@/features/site/data/about";
import { EMAIL, MAPS } from "@/features/site/data/contact";
import { SOCIAL } from "@/features/site/data/social";
import { SITE_URL } from "@/features/site/data/site";
import { isDateTag, tagLabel } from "@/features/content/data/tags";

export const SITE = SITE_URL;
export const ORG_ID = `${SITE}/#organization`;

export type Bi = { en: string; ko?: string };

export const ORG = {
  name: "Sigma Intelligence",
  nameKo: "시그마 인텔리전스",
  founded: "1984",
  institution: "Seoul National University",
  institutionKo: "서울대학교",
  department: FACTS[0].value,
  room: FACTS[1].value,
  address: "Building 302, Room 215-2, Seoul National University, Gwanak-gu, Seoul, KR",
  addressKo: "서울대학교 302동 215-2호",
  email: EMAIL,
  summary:
    "Sigma Intelligence is the robotics club of Seoul National University. Founded in 1984, it is Korea's first university robotics club.",
};

export const PAGES = [
  { key: "index", title: "Index", ai: "/ai", md: "/ai/index.md", human: "/", note: "identity, facts, every page" },
  { key: "about", title: "About", ai: "/ai/about", md: "/ai/about.md", human: "/", note: "curriculum, equipment" },
  { key: "archive", title: "Archive", ai: "/ai/archive", md: "/ai/archive.md", human: "/archive", note: "every build, 2007–2025; entry texts in the full corpus" },
  { key: "history", title: "History", ai: "/ai/history", md: "/ai/history.md", human: "/history", note: "events and awards by year, 1984–2026" },
  { key: "members", title: "Members", ai: "/ai/members", md: "/ai/members.md", human: "/members", note: "the executive team" },
  { key: "blog", title: "Blog", ai: "/ai/blog", md: "/ai/blog.md", human: "/blog", note: "published posts" },
  { key: "contact", title: "Contact", ai: "/ai/contact", md: "/ai/contact.md", human: "/contact", note: "email, club room, maps, channels" },
] as const;

type PageKey = (typeof PAGES)[number]["key"];

const PERIOD: Record<string, string> = {
  H1: "first half",
  H2: "second half",
  Spring: "spring",
  Summer: "summer",
  Fall: "fall",
  Winter: "winter",
};

function isoDate(raw: string, year: number): { iso: string; period?: string; exact: boolean } {
  const s = raw.trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})~(\d{2})$/.exec(s);
  if (m) return { iso: `${m[1]}-${m[2]}-${m[3]}/${m[1]}-${m[2]}-${m[4]}`, exact: true };
  if (/^\d{4}-\d{2}(-\d{2})?$/.test(s)) return { iso: s, exact: true };
  m = /^(\d{4}) (H1|H2|Spring|Summer|Fall|Winter)$/.exec(s);
  if (m) return { iso: m[1], period: PERIOD[m[2]], exact: false };
  if (/^\d{4}$/.test(s)) return { iso: s, exact: false };
  return { iso: String(year), exact: false };
}

type Front = Record<string, string>;

function readMd(file: string): { data: Front; body: string } | null {
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  const data: Front = {};
  if (m) {
    for (const line of m[1].split(/\r?\n/)) {
      const at = line.indexOf(":");
      if (at > 0) data[line.slice(0, at).trim()] = line.slice(at + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
  return { data, body: (m ? raw.slice(m[0].length) : raw).trim() };
}

const list = (v?: string) =>
  (v ?? "")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

const tagsOf = (raw: string[]): Bi[] => raw.filter((t) => !isDateTag(t)).map(tagLabel);

export interface Build {
  id: string;
  title: Bi;
  year: number | null;
  era: string;
  award?: Bi;
  tags: Bi[];
  team: string[];
  body: string;
  url: string;
}

export function getBuilds(): Build[] {
  return [...ARCHIVE]
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title))
    .map((p) => {
      const doc = readMd(path.join(process.cwd(), "content", "archive", `${p.id}.md`));
      const t = splitTitle(p.title);
      const ko = doc?.data.titleKo || (t.ko !== t.en ? t.ko : undefined);
      return {
        id: p.id,
        title: { en: t.en, ko },
        year: p.year,
        era: ERAS.find((e) => e.key === p.era)?.label ?? p.era,
        award: p.award,
        tags: tagsOf(list(doc?.data.tags)),
        team: list(doc?.data.team).map((m) => m.replace(/\s*\([^)]*\)/g, "").trim()),
        body: doc?.body ?? "",
        url: `${SITE}/archive?view=reel&at=${p.id}`,
      };
    });
}

export interface Post {
  slug: string;
  title: Bi;
  date: string;
  summary?: Bi;
  tags: Bi[];
  team: string[];
  body: string;
  url: string;
}

export function getPosts(): Post[] {
  const dir = path.join(process.cwd(), "content", "posts");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f): Post | null => {
      const slug = f.replace(/\.md$/, "");
      const doc = readMd(path.join(dir, f));
      if (!doc || doc.data.sample === "true") return null;
      const d = doc.data;
      return {
        slug,
        title: { en: d.title || slug, ko: d.titleKo || undefined },
        date: d.date || d.year || "",
        summary: d.summary ? { en: d.summary, ko: d.summaryKo || undefined } : undefined,
        tags: tagsOf(list(d.tags)),
        team: list(d.team),
        body: doc.body,
        url: `${SITE}/blog/${slug}`,
      };
    })
    .filter((p): p is Post => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export interface Entry {
  id: string;
  iso: string;
  period?: string;
  title: Bi;
  kind: "event" | "award";
  count: number;
  build?: { id: string; url: string };
  work?: string;
}

export async function getHistory(): Promise<{ year: number; entries: Entry[] }[]> {
  const nodes = await getTimeline();
  return nodes.map((n) => ({
    year: n.year,
    entries: n.events.map((e) => {
      const d = isoDate(e.date, n.year);
      const id = soleWork(e.work);
      return {
        id: e.id,
        iso: d.iso,
        period: d.period,
        title: e.title,
        kind: e.award ? "award" : "event",
        count: e.count ?? 1,
        build: id ? { id, url: `${SITE}/archive?view=reel&at=${id}` } : undefined,
        work: e.work,
      } satisfies Entry;
    }),
  }));
}

export async function getMembers() {
  const team = await getTeam();
  return team.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role ?? m.duty ?? INCOMING,
    duty: m.role ? m.duty : undefined,
    department: m.department,
    bio: m.bio,
    links: m.links ? Object.entries(m.links).filter(([, v]) => v) : [],
  }));
}

export { ALUMNI_TOTAL, COHORT_COUNT, FIRST_INTAKE, LAST_INTAKE, AWARDS, CURRICULUM, EQUIPMENT, FACTS, MAPS, SOCIAL };

const bi = (b: Bi) => (b.ko && b.ko !== b.en ? `${b.en} (${b.ko})` : b.en);
const abs = (p: string) => (p.startsWith("http") ? p : `${SITE}${p}`);
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n+/g, " ");

function table(head: string[], rows: string[][]): string {
  return [
    `| ${head.join(" | ")} |`,
    `| ${head.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.map(cell).join(" | ")} |`),
  ].join("\n");
}

function heading(title: string, key: PageKey): string {
  const page = PAGES.find((p) => p.key === key)!;
  return [
    `# ${title}`,
    "",
    `> ${ORG.summary}`,
    "",
    `Site page: ${abs(page.human)} · Terminal: ${abs(page.ai)} · Index: ${SITE}/llms.txt`,
  ].join("\n");
}

function mdIdentity(): string {
  return table(
    ["Field", "Value"],
    [
      ["Name", `${ORG.name} (${ORG.nameKo})`],
      ["Type", "University robotics club"],
      ["Founded", ORG.founded],
      ["Institution", `${ORG.institution} (${ORG.institutionKo})`],
      ["Department", bi(FACTS[0].value)],
      ["Club room", `${ORG.room.en} (${ORG.room.ko})`],
      ["Email", ORG.email],
      ["Website", SITE],
      ["Channels", SOCIAL.map((s) => `${s.name}: ${s.href}`).join("; ")],
    ],
  );
}

async function mdIndex(): Promise<string> {
  const history = await getHistory();
  const entries = history.reduce((n, y) => n + y.entries.reduce((m, e) => m + e.count, 0), 0);
  return [
    heading("SIGMA INTELLIGENCE — terminal", "index"),
    "",
    "## About",
    "",
    mdIdentity(),
    "",
    "## Record",
    "",
    table(
      ["Measure", "Value"],
      [
        ["Builds in the archive", `${ARCHIVE.length} (2007–2025)`],
        ["Awards", `${AWARDS.length} (${Math.min(...AWARDS.map((a) => a.year))}–${Math.max(...AWARDS.map((a) => a.year))})`],
        ["Timeline entries", String(entries)],
        ["Cohorts", `${COHORT_COUNT} (${FIRST_INTAKE}–${LAST_INTAKE}), ${ALUMNI_TOTAL} members and alumni`],
        ["Published posts", String(getPosts().length)],
      ],
    ),
    "",
    "## Pages",
    "",
    table(
      ["Page", "Contents", "Terminal", "Markdown", "Site"],
      PAGES.map((p) => [p.title, p.note, abs(p.ai), abs(p.md), abs(p.human)]),
    ),
  ].join("\n");
}

function mdAbout(): string {
  return [
    heading("About SIGMA INTELLIGENCE", "about"),
    "",
    "## About",
    "",
    mdIdentity(),
    "",
    "## Curriculum",
    "",
    ...CURRICULUM.map((c) => `- ${c.href ? `[${c.en}](${c.href})` : c.en}${c.ko !== c.en ? ` (${c.ko})` : ""}`),
    "",
    "## Equipment",
    "",
    ...EQUIPMENT.map((e) => `- ${bi(e)}`),
  ].join("\n");
}

function mdArchive(full = false): string {
  const builds = getBuilds();
  const out = [
    heading("Archive — builds 2007–2025", "archive"),
    "",
    `${builds.length} builds, newest first. Each has its own section below; its site page opens the build in the archive reel.`,
    "",
    table(
      ["ID", "Year", "Title", "Korean title", "Award", "Tags", "Team size"],
      builds.map((b) => [
        b.id,
        b.year ? String(b.year) : "unknown",
        b.title.en,
        b.title.ko ?? "",
        b.award?.en ?? "",
        b.tags.map((t) => t.en).join(", "),
        b.team.length ? String(b.team.length) : "",
      ]),
    ),
    "",
  ];
  for (const b of builds) {
    out.push(
      `## ${b.title.en}${b.year ? ` (${b.year})` : ""}`,
      "",
      `- ID: ${b.id}`,
      `- Year: ${b.year ?? "unknown"} · Era: ${b.era}`,
      ...(b.title.ko ? [`- Korean title: ${b.title.ko}`] : []),
      ...(b.award ? [`- Award: ${bi(b.award)}`] : []),
      ...(b.tags.length ? [`- Tags: ${b.tags.map(bi).join(", ")}`] : []),
      ...(b.team.length ? [`- Team: ${b.team.join(", ")}`] : []),
      `- URL: ${b.url}`,
      "",
    );
    if (full && b.body) out.push("Entry text (Korean):", "", b.body, "");
  }
  return out.join("\n");
}

async function mdHistory(): Promise<string> {
  const history = await getHistory();
  const out = [
    heading("History — 1984 to 2026", "history"),
    "",
    "Dates are ISO 8601. Where the record gives only a year, the Period column says which part of it (first half, second half, a season). An award counted more than once appears once with its count.",
    "",
  ];
  for (const y of history) {
    out.push(
      `## ${y.year}`,
      "",
      table(
        ["Date", "Period", "Kind", "Entry", "Korean", "Build"],
        y.entries.map((e) => [
          e.iso,
          e.period ?? "",
          e.kind === "award" ? `award${e.count > 1 ? ` ×${e.count}` : ""}` : "event",
          e.title.en,
          e.title.ko ?? "",
          e.build ? e.build.url : e.work ?? "",
        ]),
      ),
      "",
    );
  }
  return out.join("\n");
}

async function mdMembers(): Promise<string> {
  const members = await getMembers();
  return [
    heading("Members — executive team", "members"),
    "",
    "The current executive team. Names are given in Korean, as the members write them; they are not romanised. Only the executive team is published.",
    "",
    table(
      ["Name", "Role", "Role (Korean)", "Also", "Department", "Bio", "Links"],
      members.map((m) => [
        m.name,
        m.role.en,
        m.role.ko,
        m.duty ? `${m.duty.en} (${m.duty.ko})` : "",
        m.department.en,
        m.bio ?? "",
        m.links.map(([k, v]) => `${k}: ${v}`).join("; "),
      ]),
    ),
  ].join("\n");
}

function mdBlog(full = false): string {
  const posts = getPosts();
  const out = [
    heading("Blog — published posts", "blog"),
    "",
    table(
      ["Date", "Title", "Korean title", "Tags", "URL"],
      posts.map((p) => [p.date, p.title.en, p.title.ko ?? "", p.tags.map((t) => t.en).join(", "), p.url]),
    ),
    "",
  ];
  for (const p of posts) {
    out.push(
      `## ${p.title.en}`,
      "",
      `- Date: ${p.date}`,
      ...(p.title.ko ? [`- Korean title: ${p.title.ko}`] : []),
      ...(p.tags.length ? [`- Tags: ${p.tags.map(bi).join(", ")}`] : []),
      ...(p.team.length ? [`- Team: ${p.team.join(", ")}`] : []),
      `- URL: ${p.url}`,
      "",
    );
    if (full && p.body) out.push("Post text (Korean):", "", p.body, "");
  }
  return out.join("\n");
}

function mdContact(): string {
  return [
    heading("Contact", "contact"),
    "",
    table(
      ["Field", "Value"],
      [
        ["Email", ORG.email],
        ["Club room", `${ORG.address} (${ORG.addressKo})`],
        ...MAPS.map((m) => [m.name, m.href]),
        ...SOCIAL.map((s) => [s.name, s.href]),
      ],
    ),
  ].join("\n");
}

export async function mdPage(key: PageKey, full = false): Promise<string> {
  switch (key) {
    case "index":
      return mdIndex();
    case "about":
      return mdAbout();
    case "archive":
      return mdArchive(full);
    case "history":
      return mdHistory();
    case "members":
      return mdMembers();
    case "blog":
      return mdBlog(true);
    case "contact":
      return mdContact();
  }
}

export function llmsTxt(): string {
  return [
    "# SIGMA INTELLIGENCE",
    "",
    `> ${ORG.summary} This site is its archive of builds, its dated record, its members, its writing and how to reach it. Every page has a plain Markdown twin listed below.`,
    "",
    `Korean name: ${ORG.nameKo}. Founded ${ORG.founded} at ${ORG.institution} (${ORG.department.en}). Club room: ${ORG.room.en}. Email: ${ORG.email}. Dates in these files are ISO 8601.`,
    "",
    "## Pages",
    "",
    ...PAGES.map((p) => `- [${p.title}](${abs(p.md)}): ${p.note}. Human page: ${abs(p.human)}`),
    "",
    "## Full text",
    "",
    `- [Complete corpus](${SITE}/llms-full.txt): Every page above in one file, including the full text of every archive entry and post`,
    "",
    "## Optional",
    "",
    `- [Terminal (HTML)](${SITE}/ai): The same content as semantic HTML with schema.org JSON-LD`,
    `- [Sitemap](${SITE}/sitemap.xml): Every site page, including one address per build`,
  ].join("\n");
}

export async function llmsFull(): Promise<string> {
  const parts = await Promise.all(PAGES.map((p) => mdPage(p.key, true)));
  return [
    `# SIGMA INTELLIGENCE — complete corpus`,
    "",
    `> ${ORG.summary}`,
    "",
    `Generated from the same data as ${SITE}. Sections follow; each starts with its own H1.`,
    "",
    ...parts.flatMap((p) => ["---", "", p, ""]),
  ].join("\n");
}

export function textResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<${SITE}/llms.txt>; rel="describedby"; type="text/markdown"`,
    },
  });
}

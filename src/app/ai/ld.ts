// schema.org JSON-LD for the machine pages, built from the same corpus as the Markdown twins.

import { ORG, ORG_ID, SITE, SOCIAL, type Build, type Entry, type Post } from "@/app/ai/corpus";

const ctx = "https://schema.org";

export const organization = {
  "@context": ctx,
  "@type": "Organization",
  "@id": ORG_ID,
  name: ORG.name,
  alternateName: [ORG.nameKo, "SIGMA"],
  url: SITE,
  description: ORG.summary,
  foundingDate: ORG.founded,
  email: ORG.email,
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: ORG.institution,
    alternateName: ORG.institutionKo,
    url: "https://www.snu.ac.kr",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Building 302, Room 215-2, 1 Gwanak-ro",
    addressLocality: "Gwanak-gu, Seoul",
    addressCountry: "KR",
  },
  sameAs: SOCIAL.map((s) => s.href),
};

const orgRef = { "@id": ORG_ID };

export function page(path: string, name: string, description: string) {
  return {
    "@context": ctx,
    "@type": "WebPage",
    "@id": `${SITE}${path}`,
    url: `${SITE}${path}`,
    name,
    description,
    inLanguage: ["en", "ko"],
    about: orgRef,
    isPartOf: { "@type": "WebSite", url: SITE, name: ORG.name },
  };
}

export function buildsList(builds: Build[]) {
  return {
    "@context": ctx,
    "@type": "ItemList",
    name: "Sigma Intelligence builds",
    numberOfItems: builds.length,
    itemListElement: builds.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        "@id": b.url,
        url: b.url,
        name: b.title.en,
        ...(b.title.ko ? { alternateName: b.title.ko } : {}),
        ...(b.year ? { dateCreated: String(b.year) } : {}),
        ...(b.tags.length ? { keywords: b.tags.map((t) => t.en).join(", ") } : {}),
        ...(b.award ? { award: b.award.en } : {}),
        creator: orgRef,
      },
    })),
  };
}

export function eventsList(years: { year: number; entries: Entry[] }[]) {
  const items = years.flatMap((y) =>
    y.entries
      .filter((e) => e.kind === "event")
      .map((e) => ({
        "@type": "Event",
        "@id": `${SITE}/ai/history#${e.id}`,
        name: e.title.en,
        alternateName: e.title.ko,
        startDate: e.iso.split("/")[0],
        ...(e.iso.includes("/") ? { endDate: e.iso.split("/")[1] } : {}),
        organizer: orgRef,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: { "@type": "Place", name: ORG.institution },
      })),
  );
  return {
    "@context": ctx,
    "@type": "ItemList",
    name: "Sigma Intelligence timeline",
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
  };
}

export function awardsOf(years: { year: number; entries: Entry[] }[]) {
  return {
    "@context": ctx,
    "@type": "Organization",
    "@id": ORG_ID,
    award: years.flatMap((y) =>
      y.entries.filter((e) => e.kind === "award").map((e) => `${y.year}: ${e.title.en}${e.count > 1 ? ` (×${e.count})` : ""}`),
    ),
  };
}

export function membersList(
  members: { id: string; name: string; role: { en: string }; department: { en: string } }[],
) {
  return {
    "@context": ctx,
    "@type": "Organization",
    "@id": ORG_ID,
    member: members.map((m) => ({
      "@type": "OrganizationRole",
      roleName: m.role.en,
      member: {
        "@type": "Person",
        "@id": `${SITE}/ai/members#${m.id}`,
        name: m.name,
        affiliation: { "@type": "CollegeOrUniversity", name: ORG.institution },
        description: m.department.en,
      },
    })),
  };
}

export function postsList(posts: Post[]) {
  return {
    "@context": ctx,
    "@type": "ItemList",
    name: "Sigma Intelligence blog",
    numberOfItems: posts.length,
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Article",
        "@id": p.url,
        url: p.url,
        headline: p.title.en,
        ...(p.title.ko ? { alternativeHeadline: p.title.ko } : {}),
        ...(p.date ? { datePublished: p.date } : {}),
        inLanguage: "ko",
        author: orgRef,
        publisher: orgRef,
        ...(p.tags.length ? { keywords: p.tags.map((t) => t.en).join(", ") } : {}),
      },
    })),
  };
}

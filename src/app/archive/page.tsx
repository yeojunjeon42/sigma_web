import type { Metadata } from "next";
import { headers } from "next/headers";
import { share } from "@/app/share";
import { getArchiveWithMedia } from "@/features/archive/api/getArchive";
import { getDoc } from "@/features/content/api/getContent";
import { koOf, readings } from "@/features/content/reading";
import { splitTitle } from "@/features/archive/components/splitTitle";
import ArchiveView, { ARCHIVE_META, type ArchiveQuery } from "./view";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ at?: string; lang?: string }>;
}): Promise<Metadata> {
  const { at, lang } = await searchParams;
  const build = at ? (await getArchiveWithMedia()).find((p) => p.id === at) : undefined;
  if (!build) return ARCHIVE_META;
  const name = splitTitle(build.title).en;
  const description = [
    `${name}${build.year ? `, ${build.year}` : ""}.`,
    build.award ? `${build.award.en}.` : "",
    "A build by SIGMA INTELLIGENCE, the robotics club of Seoul National University.",
  ]
    .filter(Boolean)
    .join(" ");
  const href = `/archive?view=reel&at=${build.id}`;
  const langs = (await getDoc("archive", build.id))?.langs ?? [];
  // Each reading is its own canonical address; both name the pair.
  const own = lang === "ko" && langs.includes("ko") ? koOf(href) : href;
  return { title: name, description, ...share(own, { title: name, description, languages: readings(href, langs) }) };
}

export default async function ArchivePage({ searchParams }: { searchParams: Promise<ArchiveQuery> }) {
  const ua = await headers();
  const phone = ua.get("sec-ch-ua-mobile") === "?1" || /Mobi/i.test(ua.get("user-agent") ?? "");
  return <ArchiveView query={await searchParams} phone={phone} />;
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import { share } from "@/app/share";
import { pick } from "@/i18n/config";
import { META } from "@/i18n/dict/meta";
import { localeOf, type PageProps } from "@/i18n/server";
import { getArchiveWithMedia } from "@/features/archive/api/getArchive";
import { splitTitle } from "@/features/archive/components/splitTitle";
import ArchiveView, { archiveMeta, type ArchiveQuery } from "./view";

export async function generateMetadata({ params, searchParams }: PageProps & { searchParams: Promise<{ at?: string }> }): Promise<Metadata> {
  const locale = await localeOf(params);
  const { at } = await searchParams;
  const build = at ? (await getArchiveWithMedia()).find((p) => p.id === at) : undefined;
  if (!build) return archiveMeta(locale);
  const name = pick(locale, splitTitle(build.title));
  const description = META[locale].build(name, build.year, build.award && pick(locale, build.award));
  return { title: name, description, ...share(locale, `/archive?view=reel&at=${build.id}`, { title: name, description }) };
}

export default async function ArchivePage({ params, searchParams }: PageProps & { searchParams: Promise<ArchiveQuery> }) {
  const ua = await headers();
  const phone = ua.get("sec-ch-ua-mobile") === "?1" || /Mobi/i.test(ua.get("user-agent") ?? "");
  return <ArchiveView locale={await localeOf(params)} query={await searchParams} phone={phone} />;
}

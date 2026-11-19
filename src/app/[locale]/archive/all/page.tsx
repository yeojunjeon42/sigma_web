import { localeOf, type PageProps } from "@/i18n/server";
import ArchiveView, { archiveMeta } from "../view";

// Prerender the default view; next.config.ts rewrites /archive here.
export const generateMetadata = async ({ params }: PageProps) => archiveMeta(await localeOf(params));

export default async function ArchiveDefault({ params }: PageProps) {
  return <ArchiveView locale={await localeOf(params)} query={{}} phone={false} eager={false} />;
}

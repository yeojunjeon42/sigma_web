import ArchiveView, { ARCHIVE_META } from "../view";

// Prerender the default view; next.config.ts rewrites /archive here.
export const metadata = ARCHIVE_META;

export default function ArchiveDefault() {
  return <ArchiveView query={{}} phone={false} eager={false} />;
}

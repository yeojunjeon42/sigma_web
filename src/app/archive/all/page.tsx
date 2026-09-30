import ArchiveView, { ARCHIVE_META } from "../view";

// A bare /archive is rewritten here (next.config.ts): the default view, built ahead of time with
// both trees, so the busiest archive address never waits on a function.
export const metadata = ARCHIVE_META;

export default function ArchiveDefault() {
  return <ArchiveView query={{}} phone={false} eager={false} />;
}

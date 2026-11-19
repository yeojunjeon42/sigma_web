import ContactPill from "@/components/ContactPill";
import type { Locale } from "@/i18n/config";
import { ARCHIVE_TEXT } from "@/i18n/dict/archive";

export default function AddBuild({ locale }: { locale: Locale }) {
  return <ContactPill about="archive" pill={ARCHIVE_TEXT[locale].add} showOnMobile id="archive-action" className="archive-action" />;
}

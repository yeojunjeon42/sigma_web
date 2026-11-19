import type { Metadata } from "next";
import LostPage from "@/components/pacman/LostPage";
import { META } from "@/i18n/dict/meta";

// This file is given no address, so the tab's title is English in both languages; the page reads its own.
export const metadata: Metadata = { title: META.en.notFound };

export default function NotFound() {
  return <LostPage word="404" />;
}

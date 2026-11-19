import type { Locale } from "@/i18n/config";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-11-04" as "Nov 4, 2026" or "2026년 11월 4일"; a month or a year alone the same way.
export function formatDate(value: string | number | undefined, locale: Locale = "en"): string | null {
  const raw = value === undefined ? "" : String(value).trim();
  if (!raw) return null;
  const m = /^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/.exec(raw);
  if (!m) return raw;
  const [, y, mo, d] = m;
  if (locale === "ko") return [`${y}년`, mo && `${Number(mo)}월`, d && `${Number(d)}일`].filter(Boolean).join(" ");
  const name = mo ? MONTHS[Number(mo) - 1] : undefined;
  if (!name) return y;
  return d ? `${name} ${Number(d)}, ${y}` : `${name} ${y}`;
}

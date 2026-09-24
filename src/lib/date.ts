import type { Bilingual } from "@/features/archive/types";

const MONTH_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDate(value: string | number | undefined): Bilingual | null {
  if (value === undefined || value === null) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const m = /^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/.exec(raw);
  if (!m) return { en: raw, ko: raw };

  const [, y, mo, d] = m;
  if (!mo) return { en: y, ko: y };

  const month = Number(mo);
  if (month < 1 || month > 12) return { en: y, ko: y };
  const name = MONTH_EN[month - 1];

  if (!d) return { en: `${name} ${y}`, ko: `${y}년 ${month}월` };
  return {
    en: `${name} ${Number(d)}, ${y}`,
    ko: `${y}년 ${month}월 ${Number(d)}일`,
  };
}

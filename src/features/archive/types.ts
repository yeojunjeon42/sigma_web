

export interface Photo {
  src: string;
  width: number;
  height: number;
  /** CSS object-position for a cover crop, when the centre isn't right. */
  focus?: string;
}

export interface Bilingual {
  en: string;
  ko: string;
}

export type Era =
  | "2007-2014"
  | "2015"
  | "2016"
  | "2017"
  | "2020"
  | "2024"
  | "2025";

export interface ArchiveProject {
  id: string;
  title: string;
  year: number | null;
  era: Era;
  award?: Bilingual;
  photosOnly?: boolean;
  wide?: boolean;
  tall?: boolean;
  imageUrl?: string;
  imageW?: number;
  imageH?: number;
  imageFocus?: string;
}

export const ERAS: { key: Era; label: Bilingual }[] = [
  { key: "2007-2014", label: { en: "2007–2014", ko: "2007–2014" } },
  { key: "2015", label: { en: "2015", ko: "2015" } },
  { key: "2016", label: { en: "2016", ko: "2016" } },
  { key: "2017", label: { en: "2017", ko: "2017" } },
  { key: "2020", label: { en: "2020", ko: "2020" } },
  { key: "2024", label: { en: "2024", ko: "2024" } },
  { key: "2025", label: { en: "2025", ko: "2025" } },
];

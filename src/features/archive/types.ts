export interface Photo {
  src: string;
  width: number;
  height: number;
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

export const ERAS: { key: Era; label: string }[] = [
  { key: "2007-2014", label: "2007–2014" },
  { key: "2015", label: "2015" },
  { key: "2016", label: "2016" },
  { key: "2017", label: "2017" },
  { key: "2020", label: "2020" },
  { key: "2024", label: "2024" },
  { key: "2025", label: "2025" },
];

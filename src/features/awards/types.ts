export interface Bilingual {
  en: string;
  ko: string;
}

export interface Award {
  id: string;
  year: number;
  contest: Bilingual;
  result: Bilingual;
  work?: string;
}


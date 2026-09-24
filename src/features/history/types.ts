export interface Bilingual {
  en: string;
  ko: string;
}

export interface HistoryEvent {
  id: string;
  date: string;
  title: Bilingual;
  award?: boolean;
  work?: string;
  count?: number;
}

export interface YearNode {
  year: number;
  events: HistoryEvent[];
}

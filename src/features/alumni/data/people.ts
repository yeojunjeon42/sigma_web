import type { Bilingual } from "@/features/site/data/about";
import type { MemberLinks } from "@/features/members/data/roster";

interface Alumnus {
  id: string;
  name: string;
  field: Bilingual;
  entryYear: number;
  quote?: string;
  links?: MemberLinks;
}

export const ALUMNI: Alumnus[] = [];

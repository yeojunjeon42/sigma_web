import { AWARDS } from "@/features/awards/data/awards";
import { TIMELINE } from "../data/timeline";
import type { HistoryEvent, YearNode } from "../types";

// The fair has one name in Korean, whichever way a year's record wrote it.
const fair = (contest: string) => contest.replace(/^(?:서울대 )?(제\d+회) (?:서울대 )?창의설계축전$/, "$1 서울대학교 창의설계축전");

export async function getTimeline(): Promise<YearNode[]> {
  const byYear = new Map<number, HistoryEvent[]>();

  for (const node of TIMELINE) {
    byYear.set(node.year, [...node.events]);
  }

  for (const award of AWARDS) {
    const events = byYear.get(award.year) ?? [];
    const title = {
      en: `${award.contest.en} — ${award.result.en}`,
      ko: `${fair(award.contest.ko)} — ${award.result.ko}`,
    };

    const twin = award.work
      ? undefined
      : events.find((e) => e.award && !e.work && e.title.en === title.en);

    if (twin) twin.count = (twin.count ?? 1) + 1;
    else
      events.push({
        id: `award-${award.id}`,
        date: "",
        award: true,
        work: award.work,
        title,
      });

    byYear.set(award.year, events);
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, events]) => ({ year, events }));
}

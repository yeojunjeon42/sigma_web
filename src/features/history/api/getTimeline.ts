import { AWARDS } from "@/features/awards/data/awards";
import { TIMELINE } from "../data/timeline";
import type { HistoryEvent, YearNode } from "../types";

export async function getTimeline(): Promise<YearNode[]> {
  const byYear = new Map<number, HistoryEvent[]>();

  for (const node of TIMELINE) {
    byYear.set(node.year, [...node.events]);
  }

  for (const award of AWARDS) {
    const events = byYear.get(award.year) ?? [];
    const title = {
      en: `${award.contest.en} — ${award.result.en}`,
      ko: `${award.contest.ko} — ${award.result.ko}`,
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

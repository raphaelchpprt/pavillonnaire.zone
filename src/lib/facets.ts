import { compareFrench, dedupeTokens } from '@/lib/normalize';
import { Entry, Facets } from '@/types/entry';

export function computeFacets(entries: Entry[]): Facets {
  const dates = new Set<string>();

  for (const entry of entries) {
    if (entry.year != null) dates.add(String(entry.year));
  }

  return {
    date: Array.from(dates).sort((a, b) => Number(b) - Number(a)),
    author: dedupeTokens(entries.flatMap((e) => e.authors)).sort(compareFrench),
    place: dedupeTokens(entries.flatMap((e) => e.places)).sort(compareFrench),
    type: dedupeTokens(entries.flatMap((e) => e.types)).sort(compareFrench),
  };
}

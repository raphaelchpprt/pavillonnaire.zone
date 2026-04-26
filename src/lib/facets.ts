import { Entry, Facets } from '@/types/entry';

export function computeFacets(entries: Entry[]): Facets {
  const dates = new Set<string>();
  const authors = new Set<string>();
  const places = new Set<string>();
  const types = new Set<string>();

  for (const entry of entries) {
    if (entry.year != null) dates.add(String(entry.year));
    for (const a of entry.authors) authors.add(a);
    if (entry.place) places.add(entry.place);
    if (entry.type) types.add(entry.type);
  }

  return {
    date: Array.from(dates).sort((a, b) => Number(b) - Number(a)),
    author: Array.from(authors).sort((a, b) => a.localeCompare(b, 'fr')),
    place: Array.from(places).sort((a, b) => a.localeCompare(b, 'fr')),
    type: Array.from(types).sort((a, b) => a.localeCompare(b, 'fr')),
  };
}

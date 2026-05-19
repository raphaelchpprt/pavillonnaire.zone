import { canonicalKey } from '@/lib/normalize';
import { Entry, Facets } from '@/types/entry';

function collectFacetValues(
  entries: Entry[],
  getTokens: (entry: Entry) => string[],
): string[] {
  const byCanonical = new Map<string, string>();

  for (const entry of entries) {
    for (const token of getTokens(entry)) {
      const key = canonicalKey(token);
      if (!byCanonical.has(key)) byCanonical.set(key, token);
    }
  }

  return Array.from(byCanonical.values());
}

export function computeFacets(entries: Entry[]): Facets {
  const dates = new Set<string>();

  for (const entry of entries) {
    if (entry.year != null) dates.add(String(entry.year));
  }

  return {
    date: Array.from(dates).sort((a, b) => Number(b) - Number(a)),
    author: collectFacetValues(entries, (e) => e.authors).sort((a, b) =>
      a.localeCompare(b, 'fr'),
    ),
    place: collectFacetValues(entries, (e) => e.places).sort((a, b) =>
      a.localeCompare(b, 'fr'),
    ),
    type: collectFacetValues(entries, (e) => e.types).sort((a, b) =>
      a.localeCompare(b, 'fr'),
    ),
  };
}

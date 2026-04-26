import { ActiveFilters, FilterField } from '@/types/entry';

const FILTER_FIELDS: FilterField[] = ['date', 'author', 'place', 'type'];

type ReadableSearchParams = Pick<URLSearchParams, 'get' | 'toString'>;

export function parseFiltersFromUrl(searchParams: ReadableSearchParams): ActiveFilters {
  const parse = (key: string) =>
    searchParams.get(key)?.split(',').filter(Boolean) ?? [];
  return {
    date: parse('date'),
    author: parse('author'),
    place: parse('place'),
    type: parse('type'),
  };
}

export function buildFilterUrl(
  activeFilters: ActiveFilters,
  existingParams: ReadableSearchParams,
): string {
  const params = new URLSearchParams(existingParams.toString());
  for (const field of FILTER_FIELDS) {
    const values = activeFilters[field];
    if (values.length > 0) {
      params.set(field, values.join(','));
    } else {
      params.delete(field);
    }
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

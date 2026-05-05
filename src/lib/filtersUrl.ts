import { ActiveFilters, FilterField, ViewMode } from '@/types/entry';

const FILTER_FIELDS = ['date', 'author', 'place', 'type'] satisfies FilterField[];

type ReadableSearchParams = Pick<URLSearchParams, 'get' | 'getAll' | 'toString'>;

export function parseFiltersFromUrl(searchParams: ReadableSearchParams): ActiveFilters {
  const parse = (key: string) => searchParams.getAll(key);
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
    params.delete(field);
    for (const value of activeFilters[field]) {
      params.append(field, value);
    }
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

export function buildViewUrl(
  view: ViewMode | null,
  existingParams: ReadableSearchParams,
): string {
  const params = new URLSearchParams(existingParams.toString());
  if (view === 'grid') {
    params.set('view', 'grid');
  } else {
    params.delete('view');
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

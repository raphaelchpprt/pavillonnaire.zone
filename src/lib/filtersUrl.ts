import { ActiveFilters, EntrySort, FilterField, ViewMode } from "@/types/entry";

const FILTER_FIELDS = [
  "date",
  "author",
  "place",
  "type",
] satisfies FilterField[];

type ReadableSearchParams = Pick<
  URLSearchParams,
  "get" | "getAll" | "toString"
>;

export function parseFiltersFromUrl(
  searchParams: ReadableSearchParams,
): ActiveFilters {
  const parse = (key: string) => searchParams.getAll(key);
  return {
    date: parse("date"),
    author: parse("author"),
    place: parse("place"),
    type: parse("type"),
  };
}

export function hasPanelFilters(activeFilters: ActiveFilters): boolean {
  return FILTER_FIELDS.some((field) => activeFilters[field].length > 0);
}

export function parseSortFromUrl(
  searchParams: ReadableSearchParams,
): EntrySort {
  const sort = searchParams.get("sort");
  if (sort === "date-asc" || sort === "date-desc" || sort === "title") {
    return sort;
  }
  return "title";
}

export function buildSortUrl(
  sort: EntrySort,
  existingParams: ReadableSearchParams,
): string {
  const params = new URLSearchParams(existingParams.toString());
  if (sort === "title") {
    params.delete("sort");
  } else {
    params.set("sort", sort);
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function buildFiltersResetUrl(
  existingParams: ReadableSearchParams,
): string {
  const params = new URLSearchParams(existingParams.toString());
  for (const field of FILTER_FIELDS) {
    params.delete(field);
  }
  params.delete("sort");
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
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
  return qs ? `/?${qs}` : "/";
}

export function buildViewUrl(
  view: ViewMode | null,
  existingParams: ReadableSearchParams,
): string {
  const params = new URLSearchParams(existingParams.toString());
  if (view === "grid") {
    params.set("view", "grid");
  } else {
    params.delete("view");
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function buildIndexOpenUrl(
  existingParams: ReadableSearchParams,
): string {
  const params = new URLSearchParams(existingParams.toString());
  params.set("index", "open");
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function buildIndexCloseUrl(
  existingParams: ReadableSearchParams,
): string {
  const params = new URLSearchParams(existingParams.toString());
  params.delete("index");
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

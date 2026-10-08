import { compareFrench } from "@/lib/normalize";
import { Entry, EntrySort } from "@/types/entry";

/**
 * Array.sort comparator for years; missing years always sort last,
 * regardless of `direction`.
 * @example compareYear(1990, 2010, "desc")     // → 20 (most recent first)
 * @example compareYear(2010, undefined, "asc") // → -1 (missing year last)
 */
function compareYear(
  a: number | undefined,
  b: number | undefined,
  direction: "asc" | "desc",
): number {
  const aMissing = a == null;
  const bMissing = b == null;
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;
  return direction === "asc" ? a - b : b - a;
}

const compareTitle = (a: Entry, b: Entry) => compareFrench(a.title, b.title);

export function sortEntries(entries: Entry[], sort: EntrySort): Entry[] {
  const sorted = [...entries];
  if (sort === "title") return sorted.sort(compareTitle);

  const direction = sort === "date-asc" ? "asc" : "desc";
  return sorted.sort(
    (a, b) => compareYear(a.year, b.year, direction) || compareTitle(a, b),
  );
}

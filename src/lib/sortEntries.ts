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

export function sortEntries(entries: Entry[], sort: EntrySort): Entry[] {
  const sorted = [...entries];

  switch (sort) {
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "fr"));
    case "date-asc":
      return sorted.sort((a, b) => {
        const byYear = compareYear(a.year, b.year, "asc");
        return byYear !== 0 ? byYear : a.title.localeCompare(b.title, "fr");
      });
    case "date-desc":
      return sorted.sort((a, b) => {
        const byYear = compareYear(a.year, b.year, "desc");
        return byYear !== 0 ? byYear : a.title.localeCompare(b.title, "fr");
      });
  }
}

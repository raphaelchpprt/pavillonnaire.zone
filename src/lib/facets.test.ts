import { describe, expect, it } from "vitest";
import { computeFacets } from "@/lib/facets";
import { Entry } from "@/types/entry";

const entry = (partial: Partial<Entry>): Entry =>
  ({
    id: partial.title ?? "id",
    category: "edition",
    title: partial.title ?? "",
    types: [],
    places: [],
    authors: [],
    ...partial,
  }) as Entry;

describe("computeFacets", () => {
  it("returns empty facets for no entries", () => {
    expect(computeFacets([])).toEqual({
      date: [],
      author: [],
      place: [],
      type: [],
    });
  });

  it("lists distinct years sorted descending", () => {
    const facets = computeFacets([
      entry({ year: 1998 }),
      entry({ year: 2010 }),
      entry({ year: 1998 }),
    ]);
    expect(facets.date).toEqual(["2010", "1998"]);
  });

  it("ignores entries without a year", () => {
    const facets = computeFacets([entry({}), entry({ year: 2000 })]);
    expect(facets.date).toEqual(["2000"]);
  });

  it("dedupes facet values canonically and sorts them", () => {
    const facets = computeFacets([
      entry({ types: ["Roman", "essai"] }),
      entry({ types: ["roman"] }),
    ]);
    // "Roman" and "roman" collapse to one (first display form wins)
    expect(facets.type).toEqual(["essai", "Roman"]);
  });

  it("collects authors and places", () => {
    const facets = computeFacets([
      entry({ authors: ["Zola"], places: ["Lyon"] }),
      entry({ authors: ["Hugo"], places: ["Paris"] }),
    ]);
    expect(facets.author).toEqual(["Hugo", "Zola"]);
    expect(facets.place).toEqual(["Lyon", "Paris"]);
  });
});

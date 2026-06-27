import { describe, expect, it } from "vitest";
import { sortEntries } from "@/lib/sortEntries";
import { Entry } from "@/types/entry";

const entry = (title: string, year?: number): Entry =>
  ({
    id: title,
    category: "edition",
    title,
    types: [],
    places: [],
    authors: [],
    year,
  }) as Entry;

const titles = (entries: Entry[]) => entries.map((e) => e.title);

describe("sortEntries", () => {
  it("sorts by title with French collation", () => {
    const out = sortEntries([entry("Été"), entry("avant"), entry("Zoo")], "title");
    expect(titles(out)).toEqual(["avant", "Été", "Zoo"]);
  });

  it("does not mutate the input array", () => {
    const input = [entry("b"), entry("a")];
    sortEntries(input, "title");
    expect(titles(input)).toEqual(["b", "a"]);
  });

  it("sorts ascending by year, missing years last", () => {
    const out = sortEntries(
      [entry("c", 2010), entry("noYear"), entry("a", 1990)],
      "date-asc",
    );
    expect(titles(out)).toEqual(["a", "c", "noYear"]);
  });

  it("sorts descending by year, missing years still last", () => {
    const out = sortEntries(
      [entry("a", 1990), entry("noYear"), entry("c", 2010)],
      "date-desc",
    );
    expect(titles(out)).toEqual(["c", "a", "noYear"]);
  });

  it("breaks year ties by title", () => {
    const out = sortEntries(
      [entry("beta", 2000), entry("alpha", 2000)],
      "date-asc",
    );
    expect(titles(out)).toEqual(["alpha", "beta"]);
  });
});

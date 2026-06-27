import { describe, expect, it } from "vitest";
import {
  buildFilterUrl,
  buildFiltersResetUrl,
  buildIndexCloseUrl,
  buildIndexOpenUrl,
  buildSortUrl,
  buildViewUrl,
  hasPanelFilters,
  parseFiltersFromUrl,
  parseSortFromUrl,
} from "@/lib/filtersUrl";
import { ActiveFilters } from "@/types/entry";

const params = (qs: string) => new URLSearchParams(qs);
const empty: ActiveFilters = { date: [], author: [], place: [], type: [] };

describe("parseFiltersFromUrl", () => {
  it("collects repeated values per field", () => {
    expect(
      parseFiltersFromUrl(params("date=1998&author=X&author=Y&type=roman")),
    ).toEqual({ date: ["1998"], author: ["X", "Y"], place: [], type: ["roman"] });
  });
  it("returns empty arrays when absent", () => {
    expect(parseFiltersFromUrl(params(""))).toEqual(empty);
  });
});

describe("hasPanelFilters", () => {
  it("is false when every field is empty", () => {
    expect(hasPanelFilters(empty)).toBe(false);
  });
  it("is true when any field has a value", () => {
    expect(hasPanelFilters({ ...empty, place: ["Lyon"] })).toBe(true);
  });
});

describe("parseSortFromUrl", () => {
  it("returns a known sort value", () => {
    expect(parseSortFromUrl(params("sort=date-asc"))).toBe("date-asc");
    expect(parseSortFromUrl(params("sort=date-desc"))).toBe("date-desc");
  });
  it("defaults to title when missing or unknown", () => {
    expect(parseSortFromUrl(params(""))).toBe("title");
    expect(parseSortFromUrl(params("sort=bogus"))).toBe("title");
  });
});

describe("buildSortUrl", () => {
  it("drops the param for the default title sort", () => {
    expect(buildSortUrl("title", params("view=grid&sort=date-asc"))).toBe(
      "/?view=grid",
    );
  });
  it("sets non-default sorts", () => {
    expect(buildSortUrl("date-desc", params("view=grid"))).toBe(
      "/?view=grid&sort=date-desc",
    );
  });
  it("collapses to / when no params remain", () => {
    expect(buildSortUrl("title", params(""))).toBe("/");
  });
});

describe("buildFiltersResetUrl", () => {
  it("clears filters and sort but keeps view/index", () => {
    expect(
      buildFiltersResetUrl(
        params("view=grid&index=open&date=1998&type=roman&sort=date-asc"),
      ),
    ).toBe("/?view=grid&index=open");
  });
});

describe("buildFilterUrl", () => {
  it("replaces filter fields while preserving others", () => {
    expect(
      buildFilterUrl(
        { ...empty, date: ["1998"], author: ["X"] },
        params("view=grid&date=1900"),
      ),
    ).toBe("/?view=grid&date=1998&author=X");
  });
});

describe("buildViewUrl", () => {
  it("sets grid and clears for null", () => {
    expect(buildViewUrl("grid", params(""))).toBe("/?view=grid");
    expect(buildViewUrl(null, params("view=grid"))).toBe("/");
  });
});

describe("buildIndexOpenUrl / buildIndexCloseUrl", () => {
  it("toggles the index param", () => {
    expect(buildIndexOpenUrl(params("view=grid"))).toBe(
      "/?view=grid&index=open",
    );
    expect(buildIndexCloseUrl(params("view=grid&index=open"))).toBe(
      "/?view=grid",
    );
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildMapboxMultiValueFilter,
  canonicalKey,
  dedupeTokens,
  formatFacetDisplayLabel,
  formatMultiValueString,
  matchesFilterSelection,
  normalizeToken,
  parseImagesProperty,
  parseMultiValue,
  parseYear,
} from "@/lib/normalize";

describe("normalizeToken", () => {
  it("trims and collapses internal whitespace", () => {
    expect(normalizeToken("  a   b  ")).toBe("a b");
  });
  it("collapses newlines and tabs", () => {
    expect(normalizeToken("a\n\tb")).toBe("a b");
  });
});

describe("canonicalKey", () => {
  it("lowercases with French locale and trims", () => {
    expect(canonicalKey("  ÉDITION  ")).toBe("édition");
  });
  it("treats accented case variants of the same string as equal", () => {
    expect(canonicalKey("Paris")).toBe(canonicalKey("paris"));
  });
});

describe("formatFacetDisplayLabel", () => {
  it("uppercases the first letter only", () => {
    expect(formatFacetDisplayLabel("roman")).toBe("Roman");
    expect(formatFacetDisplayLabel("édition")).toBe("Édition");
  });
  it("returns empty string for empty input", () => {
    expect(formatFacetDisplayLabel("")).toBe("");
    expect(formatFacetDisplayLabel("   ")).toBe("");
  });
});

describe("formatMultiValueString", () => {
  it("returns empty string for undefined", () => {
    expect(formatMultiValueString(undefined)).toBe("");
  });
  it("formats and joins multiple values", () => {
    expect(formatMultiValueString("roman ; essai")).toBe("Roman, Essai");
  });
  it("handles the bare semicolon separator", () => {
    expect(formatMultiValueString("roman;essai")).toBe("Roman, Essai");
  });
});

describe("parseMultiValue", () => {
  it("returns [] for empty/undefined", () => {
    expect(parseMultiValue(undefined)).toEqual([]);
    expect(parseMultiValue("")).toEqual([]);
  });
  it("splits on padded and bare separators", () => {
    expect(parseMultiValue("a ; b")).toEqual(["a", "b"]);
    expect(parseMultiValue("a;b")).toEqual(["a", "b"]);
  });
  it("skips empty segments", () => {
    expect(parseMultiValue("a ; ; b")).toEqual(["a", "b"]);
  });
  it("dedupes by canonical key, keeping the first display form", () => {
    expect(parseMultiValue("Paris ; paris")).toEqual(["Paris"]);
  });
  it("normalizes whitespace inside tokens", () => {
    expect(parseMultiValue("a   b ; c")).toEqual(["a b", "c"]);
  });
});

describe("dedupeTokens", () => {
  it("dedupes canonically and drops empties", () => {
    expect(dedupeTokens(["a", "A", "  ", "b"])).toEqual(["a", "b"]);
  });
});

describe("parseYear", () => {
  it("keeps finite numbers, including 0", () => {
    expect(parseYear(1998)).toBe(1998);
    expect(parseYear(0)).toBe(0);
  });
  it("coerces numeric strings", () => {
    expect(parseYear("1998")).toBe(1998);
    expect(parseYear("  2001  ")).toBe(2001);
  });
  it("rejects non-numeric and empty strings", () => {
    expect(parseYear("")).toBeUndefined();
    expect(parseYear("   ")).toBeUndefined();
    expect(parseYear("abc")).toBeUndefined();
  });
  it("rejects non-finite and non-string/number inputs", () => {
    expect(parseYear(Infinity)).toBeUndefined();
    expect(parseYear(NaN)).toBeUndefined();
    expect(parseYear(undefined)).toBeUndefined();
    expect(parseYear(null)).toBeUndefined();
    expect(parseYear({})).toBeUndefined();
  });
});

describe("parseImagesProperty", () => {
  it("parses a JSON array string", () => {
    expect(parseImagesProperty({ images: '["a","b"]' })).toEqual(["a", "b"]);
  });
  it("accepts a real array", () => {
    expect(parseImagesProperty({ images: ["a", "b"] })).toEqual(["a", "b"]);
  });
  it("filters out empty and non-string entries", () => {
    expect(parseImagesProperty({ images: [1, "", "  ", "x"] })).toEqual(["x"]);
  });
  it("returns undefined for an empty array", () => {
    expect(parseImagesProperty({ images: "[]" })).toBeUndefined();
  });
  it("returns undefined for a non-array JSON value", () => {
    expect(parseImagesProperty({ images: "{}" })).toBeUndefined();
  });
  it("returns undefined when the property is missing", () => {
    expect(parseImagesProperty({})).toBeUndefined();
  });

  describe("malformed JSON", () => {
    afterEach(() => vi.restoreAllMocks());
    it("returns undefined and warns", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      expect(parseImagesProperty({ images: "not json" })).toBeUndefined();
      expect(warn).toHaveBeenCalledOnce();
    });
  });
});

describe("matchesFilterSelection", () => {
  it("matches everything when nothing is selected", () => {
    expect(matchesFilterSelection(["Roman"], [])).toBe(true);
  });
  it("matches case/accent-insensitively", () => {
    expect(matchesFilterSelection(["Roman"], ["roman"])).toBe(true);
  });
  it("returns false when no selected value is present", () => {
    expect(matchesFilterSelection(["Roman"], ["essai"])).toBe(false);
  });
});

describe("buildMapboxMultiValueFilter", () => {
  it("returns null when nothing is selected", () => {
    expect(buildMapboxMultiValueFilter("type", [])).toBeNull();
  });
  it("emits an `any` expression with three clauses per value", () => {
    const expr = buildMapboxMultiValueFilter("type", ["roman", "essai"]);
    expect(Array.isArray(expr)).toBe(true);
    expect(expr?.[0]).toBe("any");
    // "any" + 3 clauses * 2 values
    expect(expr).toHaveLength(1 + 3 * 2);
  });
});

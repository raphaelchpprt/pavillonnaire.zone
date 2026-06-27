export const MULTI_VALUE_DELIMITER = " ; ";

const LOCALE = "fr-FR";

export function normalizeToken(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function canonicalKey(value: string): string {
  return normalizeToken(value).toLocaleLowerCase(LOCALE);
}

export function formatFacetDisplayLabel(value: string): string {
  const t = normalizeToken(value);
  if (t.length === 0) return t;
  return t.charAt(0).toLocaleUpperCase(LOCALE) + t.slice(1);
}

export function formatMultiValueString(raw?: string): string {
  if (!raw) return "";
  const parts = parseMultiValue(raw);
  if (parts.length === 0) return formatFacetDisplayLabel(raw);
  return parts.map(formatFacetDisplayLabel).join(", ");
}

function splitMultiValueParts(raw: string): string[] {
  return raw.split(/\s*;\s*/);
}

export function parseMultiValue(raw?: string): string[] {
  if (!raw) return [];

  const seen = new Map<string, string>();
  for (const part of splitMultiValueParts(raw)) {
    const token = normalizeToken(part);
    if (!token) continue;
    const key = canonicalKey(token);
    if (!seen.has(key)) seen.set(key, token);
  }
  return Array.from(seen.values());
}

export function dedupeTokens(tokens: string[]): string[] {
  const seen = new Map<string, string>();
  for (const token of tokens) {
    const normalized = normalizeToken(token);
    if (!normalized) continue;
    const key = canonicalKey(normalized);
    if (!seen.has(key)) seen.set(key, normalized);
  }
  return Array.from(seen.values());
}

/** Coerce a Mapbox `year` property (number or numeric string) to a number. */
export function parseYear(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function parseImagesProperty(
  record: Record<string, unknown>,
): string[] | undefined {
  const raw = record.images;
  let list: unknown[] | undefined;

  if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      console.warn("parseImagesProperty: malformed images JSON, ignoring:", raw);
      return undefined;
    }
  } else if (Array.isArray(raw)) {
    list = raw;
  }

  if (!list) return undefined;

  const urls = list.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
  return urls.length > 0 ? urls : undefined;
}

export function matchesFilterSelection(
  entryValues: string[],
  selected: string[],
): boolean {
  if (selected.length === 0) return true;
  const entryKeys = new Set(entryValues.map(canonicalKey));
  return selected.some((value) => entryKeys.has(canonicalKey(value)));
}

/** Mapbox expression matching a multi-value text field against a selection.
 *  Handles three shapes per value: exact equality, the padded ` ; ` separator,
 *  and the bare `;` separator (data sometimes omits the surrounding spaces). */
export function buildMapboxMultiValueFilter(
  property: string,
  selected: string[],
): unknown[] | null {
  if (selected.length === 0) return null;

  const field: unknown[] = ["coalesce", ["get", property], ""];

  const matches = selected.flatMap((value) => {
    const lowerValue = ["downcase", value];
    const lowerField = ["downcase", field];
    return [
      ["==", lowerField, lowerValue],
      [
        ">=",
        [
          "index-of",
          ["concat", MULTI_VALUE_DELIMITER, lowerValue, MULTI_VALUE_DELIMITER],
          ["concat", MULTI_VALUE_DELIMITER, lowerField, MULTI_VALUE_DELIMITER],
        ],
        0,
      ],
      [
        ">=",
        [
          "index-of",
          ["concat", ";", lowerValue, ";"],
          ["concat", ";", lowerField, ";"],
        ],
        0,
      ],
    ];
  });

  return ["any", ...matches];
}

/** Séparateur pour plusieurs valeurs dans une propriété Mapbox (type, lieu). */
export const MULTI_VALUE_DELIMITER = " ; ";

const LOCALE = "fr-FR";

export function normalizeToken(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function canonicalKey(value: string): string {
  return normalizeToken(value).toLocaleLowerCase(LOCALE);
}

/** Libellé facettes / liste de filtres : majuscule initiale (fr), reste identique aux données. */
export function formatFacetDisplayLabel(value: string): string {
  const t = normalizeToken(value);
  if (t.length === 0) return t;
  return t.charAt(0).toLocaleUpperCase(LOCALE) + t.slice(1);
}

/** Affichage multi-valeurs : virgules à la place des « ; » (filtres, modale, tooltip). */
export function formatMultiValueString(raw?: string): string {
  if (!raw) return "";
  const parts = parseMultiValue(raw);
  if (parts.length === 0) return formatFacetDisplayLabel(raw);
  return parts.map(formatFacetDisplayLabel).join(", ");
}

/** Découpe sur « ; » avec espaces optionnels autour. */
function splitMultiValueParts(raw: string): string[] {
  return raw.split(/\s*;\s*/);
}

/** Découpe, nettoie et fusionne les doublons (casse, espaces). */
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

/** Expression Mapbox : champ texte multi-valeurs (` ; `) contient une des sélections. */
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

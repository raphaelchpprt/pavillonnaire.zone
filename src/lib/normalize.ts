/** Séparateur pour plusieurs valeurs dans une propriété Mapbox (type, lieu). */
export const MULTI_VALUE_DELIMITER = ' ; ';

const LOCALE = 'fr-FR';

export function normalizeToken(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function canonicalKey(value: string): string {
  return normalizeToken(value).toLocaleLowerCase(LOCALE);
}

/** Découpe, nettoie et fusionne les doublons (casse, espaces). */
export function parseMultiValue(raw?: string): string[] {
  if (!raw) return [];

  const seen = new Map<string, string>();
  for (const part of raw.split(MULTI_VALUE_DELIMITER)) {
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

  if (typeof raw === 'string') {
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
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
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

  const field: unknown[] = ['coalesce', ['get', property], ''];

  const matches = selected.flatMap((value) => [
    ['==', ['downcase', field], ['downcase', value]],
    [
      '>=',
      [
        'index-of',
        ['concat', MULTI_VALUE_DELIMITER, ['downcase', value], MULTI_VALUE_DELIMITER],
        [
          'concat',
          MULTI_VALUE_DELIMITER,
          ['downcase', field],
          MULTI_VALUE_DELIMITER,
        ],
      ],
      0,
    ],
  ]);

  return ['any', ...matches];
}

/** Expression Mapbox : égalité insensible à la casse sur un champ auteur. */
export function buildMapboxAuthorMatch(
  property: string,
  value: string,
): unknown[] {
  return [
    '==',
    ['downcase', ['coalesce', ['get', property], '']],
    ['downcase', value],
  ];
}

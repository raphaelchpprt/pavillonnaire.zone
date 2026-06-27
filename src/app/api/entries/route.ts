import { NextResponse } from "next/server";
import { MAPBOX_DEFAULT_DATASET_ID_TO_LAYER } from "@/constants/mapboxDatasets";
import { isLayerType, LayerType } from "@/constants/layers";
import {
  dedupeTokens,
  parseImagesProperty,
  parseMultiValue,
  parseYear,
} from "@/lib/normalize";
import { AUTHOR_FILTER_FIELDS, Entry } from "@/types/entry";

export const dynamic = "force-dynamic";

interface MapboxFeature {
  /** Mapbox returns ids as either string or number depending on the source. */
  id: string | number;
  properties: Record<string, unknown>;
}

interface MapboxFeaturesResponse {
  features: MapboxFeature[];
}

/** Return the property when it is a non-empty string (after trim), else undefined. */
function nonEmptyStringProp(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = record[key];
  return typeof v === "string" && v.trim().length > 0 ? v : undefined;
}

function normalizeEntry(feature: MapboxFeature, category: LayerType): Entry {
  const p = feature.properties;

  const authors = dedupeTokens(
    AUTHOR_FILTER_FIELDS.flatMap((f) => parseMultiValue(nonEmptyStringProp(p, f))),
  );

  const typeRaw = nonEmptyStringProp(p, "type");
  const placeRaw = nonEmptyStringProp(p, "place");

  const images = parseImagesProperty(p);
  const image = nonEmptyStringProp(p, "image") ?? images?.[0];

  return {
    id: String(feature.id),
    category,
    title: typeof p.title === "string" ? p.title : "",
    type: typeRaw,
    types: parseMultiValue(typeRaw),
    place: placeRaw,
    places: parseMultiValue(placeRaw),
    authors,
    author: nonEmptyStringProp(p, "author"),
    director: nonEmptyStringProp(p, "director"),
    artist: nonEmptyStringProp(p, "artist"),
    album: nonEmptyStringProp(p, "album"),
    editor: nonEmptyStringProp(p, "editor"),
    year: parseYear(p.year),
    image,
    images,
    abstract: typeof p.abstract === "string" ? p.abstract : undefined,
    link: typeof p.link === "string" ? p.link : undefined,
  };
}

/**
 * Resolve a dataset's category: first via MAPBOX_DATASET_NAMES[index] when it
 * is a valid LayerType, otherwise fall back to the default id → layer map.
 */
function resolveDatasetCategory(
  index: number,
  datasetIds: string[],
  datasetNames: string[] | undefined,
): LayerType | undefined {
  const rawName = datasetNames?.[index]?.trim();
  if (rawName && isLayerType(rawName)) return rawName;

  const id = datasetIds[index];
  return MAPBOX_DEFAULT_DATASET_ID_TO_LAYER[id];
}

async function fetchDataset(
  user: string,
  datasetId: string,
  token: string,
): Promise<MapboxFeature[]> {
  const features: MapboxFeature[] = [];
  let start: string | undefined;

  do {
    const url = new URL(
      `https://api.mapbox.com/datasets/v1/${user}/${datasetId}/features`,
    );
    url.searchParams.set("access_token", token);
    url.searchParams.set("limit", "100");
    if (start) url.searchParams.set("start", start);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Dataset ${datasetId}: HTTP ${res.status}`);

    const data: MapboxFeaturesResponse = await res.json();
    if (!Array.isArray(data.features)) {
      throw new Error(`Dataset ${datasetId}: malformed response (no features)`);
    }
    features.push(...data.features);

    // Mapbox paginates with a cursor; a full page (== limit) means there is more.
    start =
      data.features.length === 100
        ? String(data.features[data.features.length - 1].id)
        : undefined;
  } while (start);

  return features;
}

export async function GET() {
  const token = process.env.MAPBOX_SECRET_TOKEN;
  const user = process.env.MAPBOX_USER;
  const datasetIds = process.env.MAPBOX_DATASET_IDS?.split(",").map((s) =>
    s.trim(),
  );
  const datasetNames = process.env.MAPBOX_DATASET_NAMES?.split(",").map((s) =>
    s.trim(),
  );

  if (!token || !user || !datasetIds?.length) {
    return NextResponse.json(
      { error: "Missing Mapbox configuration" },
      { status: 500 },
    );
  }

  const results = await Promise.allSettled(
    datasetIds.map((id) => fetchDataset(user, id, token)),
  );

  const entries: Entry[] = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const id = datasetIds[i];
    const category = resolveDatasetCategory(i, datasetIds, datasetNames);
    if (result.status === "rejected") {
      console.error(
        `Failed to fetch dataset ${category ?? id}:`,
        result.reason,
      );
      continue;
    }
    if (!category || !isLayerType(category)) {
      console.error(
        `Unknown category for dataset "${id}" (${
          datasetNames?.[i] ?? "no MAPBOX_DATASET_NAMES entry"
        }), skipping ${result.value.length} features`,
      );
      continue;
    }
    for (const feature of result.value) {
      entries.push(normalizeEntry(feature, category));
    }
  }

  // Every dataset failed: surface a real error instead of a misleading empty
  // result, so the client can tell "load failed" from "legitimately empty".
  const allFailed =
    results.length > 0 && results.every((r) => r.status === "rejected");
  if (allFailed) {
    return NextResponse.json(
      { error: "Failed to fetch any dataset" },
      { status: 502 },
    );
  }

  return NextResponse.json({ entries });
}

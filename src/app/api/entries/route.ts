import { NextResponse } from 'next/server';
import { isLayerType, LayerType } from '@/constants/layers';
import { AUTHOR_FIELDS, Entry } from '@/types/entry';

export const revalidate = 3600;

interface MapboxFeature {
  id: string;
  properties: Record<string, unknown>;
}

interface MapboxFeaturesResponse {
  features: MapboxFeature[];
}

function normalizeEntry(feature: MapboxFeature, category: LayerType): Entry {
  const p = feature.properties;

  const authors = AUTHOR_FIELDS.map((f) => p[f]).filter(
    (v): v is string => typeof v === 'string' && v.length > 0,
  );

  let images: string[] | undefined;
  if (typeof p.images === 'string') {
    try {
      images = JSON.parse(p.images);
    } catch {
      // ignore malformed JSON
    }
  }

  return {
    id: feature.id,
    category,
    title: typeof p.title === 'string' ? p.title : '',
    type: typeof p.type === 'string' ? p.type : undefined,
    authors,
    year: typeof p.year === 'number' ? p.year : undefined,
    place: typeof p.place === 'string' ? p.place : undefined,
    image: typeof p.image === 'string' ? p.image : undefined,
    images,
    abstract: typeof p.abstract === 'string' ? p.abstract : undefined,
    link: typeof p.link === 'string' ? p.link : undefined,
  };
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
    url.searchParams.set('access_token', token);
    url.searchParams.set('limit', '100');
    if (start) url.searchParams.set('start', start);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Dataset ${datasetId}: HTTP ${res.status}`);

    const data: MapboxFeaturesResponse = await res.json();
    features.push(...data.features);

    start =
      data.features.length === 100
        ? data.features[data.features.length - 1].id
        : undefined;
  } while (start);

  return features;
}

export async function GET() {
  const token = process.env.MAPBOX_SECRET_TOKEN;
  const user = process.env.MAPBOX_USER;
  const datasetIds = process.env.MAPBOX_DATASET_IDS?.split(',').map((s) => s.trim());
  const datasetNames = process.env.MAPBOX_DATASET_NAMES?.split(',').map((s) => s.trim());

  if (!token || !user || !datasetIds?.length) {
    return NextResponse.json(
      { error: 'Missing Mapbox configuration' },
      { status: 500 },
    );
  }

  const results = await Promise.allSettled(
    datasetIds.map((id) => fetchDataset(user, id, token)),
  );

  const entries: Entry[] = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const category = datasetNames?.[i] ?? datasetIds[i];
    if (result.status === 'rejected') {
      console.error(`Failed to fetch dataset ${category}:`, result.reason);
      continue;
    }
    if (!isLayerType(category)) {
      console.error(`Unknown category "${category}", skipping ${result.value.length} features`);
      continue;
    }
    for (const feature of result.value) {
      entries.push(normalizeEntry(feature, category));
    }
  }

  return NextResponse.json({ entries });
}

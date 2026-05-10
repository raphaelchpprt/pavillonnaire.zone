import type { LayerType } from '@/constants/layers';

export interface Entry {
  id: string;
  category: LayerType;
  title: string;
  type?: string;
  /** Values aggregated for facets / filtering (AUTHOR_FIELDS + album when present). */
  authors: string[];
  /** Original property strings for modal display (parallel to map features). */
  author?: string;
  director?: string;
  artist?: string;
  album?: string;
  editor?: string;
  year?: number;
  place?: string;
  image?: string;
  images?: string[];
  abstract?: string;
  link?: string;
}

export const AUTHOR_FIELDS = [
  'author',
  'director',
  'artist',
  'editor',
  'album',
] as const;
export type AuthorField = (typeof AUTHOR_FIELDS)[number];

export type FilterField = 'date' | 'author' | 'place' | 'type';

export type ViewMode = 'map' | 'grid';

export interface ActiveFilters {
  date: string[];
  author: string[];
  place: string[];
  type: string[];
}

export type Facets = ActiveFilters;

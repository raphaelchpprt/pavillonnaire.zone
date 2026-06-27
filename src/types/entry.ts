import type { LayerType } from "@/constants/layers";

export interface Entry {
  id: string;
  category: LayerType;
  title: string;
  /** Raw Mapbox value (display). */
  type?: string;
  /** Normalized for facets/filters (` ; ` separator). */
  types: string[];
  /** Raw Mapbox value (display). */
  place?: string;
  /** Normalized for facets/filters (` ; ` separator). */
  places: string[];
  /** Auteur.ices facet/filter values (author, director, artist). */
  authors: string[];
  /** Raw property strings for modal display. */
  author?: string;
  director?: string;
  artist?: string;
  album?: string;
  editor?: string;
  year?: number;
  image?: string;
  images?: string[];
  abstract?: string;
  link?: string;
}

export const AUTHOR_FIELDS = [
  "author",
  "director",
  "artist",
  "editor",
  "album",
] as const;
export type AuthorField = (typeof AUTHOR_FIELDS)[number];

/** Subset used for the "Auteur.ices" filter (excludes editor/album). */
export const AUTHOR_FILTER_FIELDS = [
  "author",
  "director",
  "artist",
] as const satisfies readonly AuthorField[];

export type FilterField = "date" | "author" | "place" | "type";

export type ViewMode = "map" | "grid";

export type EntrySort = "title" | "date-asc" | "date-desc";

export const ENTRY_SORT_VALUES = [
  "title",
  "date-asc",
  "date-desc",
] as const satisfies readonly EntrySort[];

export interface ActiveFilters {
  date: string[];
  author: string[];
  place: string[];
  type: string[];
}

export type Facets = ActiveFilters;

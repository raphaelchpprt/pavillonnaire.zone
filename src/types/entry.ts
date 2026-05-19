import type { LayerType } from '@/constants/layers';

export interface Entry {
  id: string;
  category: LayerType;
  title: string;
  /** Valeur brute Mapbox (affichage). */
  type?: string;
  /** Types normalisés pour facettes / filtres (séparateur ` ; `). */
  types: string[];
  /** Valeur brute Mapbox (affichage). */
  place?: string;
  /** Lieux normalisés pour facettes / filtres (séparateur ` ; `). */
  places: string[];
  /** Valeurs pour facette / filtre Auteur.ices (author, director, artist). */
  authors: string[];
  /** Original property strings for modal display (parallel to map features). */
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
  'author',
  'director',
  'artist',
  'editor',
  'album',
] as const;
export type AuthorField = (typeof AUTHOR_FIELDS)[number];

/** Sous-ensemble utilisé pour le filtre « Auteur.ices » (hors éditeur / album). */
export const AUTHOR_FILTER_FIELDS = [
  'author',
  'director',
  'artist',
] as const satisfies readonly AuthorField[];

export type FilterField = 'date' | 'author' | 'place' | 'type';

export type ViewMode = 'map' | 'grid';

export interface ActiveFilters {
  date: string[];
  author: string[];
  place: string[];
  type: string[];
}

export type Facets = ActiveFilters;

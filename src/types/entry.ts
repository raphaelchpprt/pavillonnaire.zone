export interface Entry {
  id: string;
  category: string;
  title: string;
  type?: string;
  authors: string[];
  year?: number;
  place?: string;
  image?: string;
  images?: string[];
  abstract?: string;
  link?: string;
}

export const AUTHOR_FIELDS = ['author', 'director', 'artist', 'editor'] as const;
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

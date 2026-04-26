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

export type FilterField = 'date' | 'author' | 'place' | 'type';

export type ViewMode = 'map' | 'grid';

export interface ActiveFilters {
  date: string[];
  author: string[];
  place: string[];
  type: string[];
}

export interface Facets {
  date: string[];
  author: string[];
  place: string[];
  type: string[];
}

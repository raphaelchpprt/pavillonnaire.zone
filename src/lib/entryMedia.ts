import { Entry } from '@/types/entry';

/** URLs image candidates pour la grille (image principale puis galerie). */
export function getEntryThumbnailUrls(entry: Entry): string[] {
  const urls: string[] = [];
  const add = (value?: string) => {
    const trimmed = value?.trim();
    if (!trimmed || urls.includes(trimmed)) return;
    urls.push(trimmed);
  };

  add(entry.image);
  entry.images?.forEach(add);
  return urls;
}

export function getEntryThumbnail(entry: Entry): string | undefined {
  return getEntryThumbnailUrls(entry)[0];
}

import { Entry } from "@/types/entry";

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

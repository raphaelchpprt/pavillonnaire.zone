"use client";

import Image from "next/image";
import { FC, useEffect, useMemo, useState } from "react";
import { Entry } from "@/types/entry";
import { getEntryThumbnailUrls } from "@/lib/entryMedia";

type EntryThumbnailProps = {
  entry: Entry;
  alt: string;
};

export const EntryThumbnail: FC<EntryThumbnailProps> = ({ entry, alt }) => {
  const urls = useMemo(() => getEntryThumbnailUrls(entry), [entry]);
  const [urlIndex, setUrlIndex] = useState(0);

  useEffect(() => {
    setUrlIndex(0);
  }, [entry.id, urls]);

  const src = urls[urlIndex];

  if (!src) {
    return <div className="h-full w-full bg-gray-100" />;
  }

  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      width={640}
      height={480}
      sizes="(max-width: 1023px) 28vw, (max-width: 1279px) 18vw, 12vw"
      className="block max-h-full w-full"
      onError={() => {
        setUrlIndex((i) => i + 1);
      }}
    />
  );
};

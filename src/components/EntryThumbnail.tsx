"use client";

import Image from "next/image";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Entry } from "@/types/entry";
import { getEntryThumbnailUrls } from "@/lib/entryMedia";

type EntryThumbnailProps = {
  entry: Entry;
  alt: string;
};

export const EntryThumbnail: FC<EntryThumbnailProps> = ({ entry, alt }) => {
  const urls = useMemo(() => getEntryThumbnailUrls(entry), [entry]);
  const [urlIndex, setUrlIndex] = useState(0);
  const loggedExhaustion = useRef(false);

  useEffect(() => {
    setUrlIndex(0);
    loggedExhaustion.current = false;
  }, [entry.id, urls]);

  const src = urls[urlIndex];

  if (!src) {
    // No usable media: a quiet dashed frame keeps the grid rhythm without
    // pretending an image is loading. Decorative — the title sits in the caption.
    return (
      <div
        className="h-full w-full border-[1.5px] border-dashed border-gray-200"
        aria-hidden
      />
    );
  }

  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      width={640}
      height={480}
      sizes="(max-width: 1023px) 28vw, (max-width: 1279px) 18vw, 12vw"
      className="block h-full w-auto max-w-full"
      onError={() => {
        setUrlIndex((i) => {
          const next = i + 1;
          if (next >= urls.length && !loggedExhaustion.current) {
            loggedExhaustion.current = true;
            console.error(
              `EntryThumbnail: all image URLs failed for entry ${entry.id}`,
              urls,
            );
          }
          return next;
        });
      }}
    />
  );
};

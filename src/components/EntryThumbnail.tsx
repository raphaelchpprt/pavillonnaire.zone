"use client";

import Image from "next/image";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Entry } from "@/types/entry";
import { getEntryThumbnailUrls } from "@/lib/entryMedia";
import { cn } from "@/utils";

type EntryThumbnailProps = {
  entry: Entry;
  alt: string;
};

// When an image, laid out at full cell height with automatic width, leaves only
// a *residual* gap on the sides, snap it to the full cell width (cropping a
// sliver top/bottom) rather than showing thin bars. The threshold is kept tight
// on purpose: images with a moderate gap (e.g. "Banlieue Pavillonnaire",
// "Dernière Danse") must stay contained with their bars, like book covers and
// logos — only near-flush images get filled. Tunable.
//
// Calibration: "Pavillonner" (gap ~20-30) should fill, while "Banlieue
// Pavillonnaire" / "Dernière Danse" (gap ~30-40) must stay contained — so the
// threshold sits between them.
const FIT_WIDTH_THRESHOLD_PX = 30;

export const EntryThumbnail: FC<EntryThumbnailProps> = ({ entry, alt }) => {
  const urls = useMemo(() => getEntryThumbnailUrls(entry), [entry]);
  const [urlIndex, setUrlIndex] = useState(0);
  const [fitWidth, setFitWidth] = useState(false);
  const loggedExhaustion = useRef(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    setUrlIndex(0);
    setFitWidth(false);
    loggedExhaustion.current = false;
  }, [entry.id, urls]);

  const measureFit = useCallback(() => {
    const img = imgRef.current;
    const cell = img?.parentElement;
    if (!img || !cell || !img.naturalWidth || !img.naturalHeight) return;
    // Width the image takes at full height with automatic width, against the
    // cell's content box. Natural dimensions keep the decision stable whatever
    // class is currently applied.
    const autoWidth = cell.clientHeight * (img.naturalWidth / img.naturalHeight);
    setFitWidth(cell.clientWidth - autoWidth <= FIT_WIDTH_THRESHOLD_PX);
  }, []);

  // `onLoadingComplete` hands us the native <img> once decoded (unlike `onLoad`)
  // — the idiomatic next/image 13.5 way to read naturalWidth without relying on
  // ref forwarding. We then observe the cell so breakpoint/layout size changes
  // re-run the measurement.
  const handleLoadingComplete = useCallback(
    (img: HTMLImageElement) => {
      imgRef.current = img;
      measureFit();
      if (!observerRef.current && img.parentElement) {
        observerRef.current = new ResizeObserver(measureFit);
        observerRef.current.observe(img.parentElement);
      }
    },
    [measureFit],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const src = urls[urlIndex];

  if (!src) {
    // No usable media: the bordered cell already keeps the grid rhythm, so an
    // empty box is enough. Decorative — the title sits in the caption.
    return <div className="h-full w-full" aria-hidden />;
  }

  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      width={640}
      height={480}
      sizes="(max-width: 1023px) 28vw, (max-width: 1279px) 18vw, 12vw"
      className={cn("block h-full max-w-full", fitWidth ? "fit-width" : "w-auto")}
      onLoadingComplete={handleLoadingComplete}
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

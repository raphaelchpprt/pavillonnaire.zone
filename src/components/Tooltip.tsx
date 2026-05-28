"use client";

import { cn, formatTypeString } from "@/utils";
import { formatMultiValueString } from "@/lib/normalize";
import { ComponentProps, FC } from "react";

function Text({ children, className }: ComponentProps<"p">) {
  return <p className={cn("text-center text-sm", className)}>{children}</p>;
}

type TooltipProps = {
  feature: mapboxgl.MapboxGeoJSONFeature["state"];
};

export const Tooltip: FC<TooltipProps> = ({ feature }) => {
  if (!feature) return null;

  const { title, type, author, director, artist, album, editor, year, place } =
    feature.properties || {};

  const types = formatTypeString(type);

  return (
    <div id={title} className="min-w-fit max-w-sm font-body scrollbar-hide">
      <h3 className="mb-2 text-center font-serif text-base leading-6">
        {title}
      </h3>
      <Text className="italic lowercase">{types}</Text>
      <Text>{formatMultiValueString(author)}</Text>
      <Text>{formatMultiValueString(director)}</Text>
      <Text>{formatMultiValueString(artist)}</Text>
      <Text>{formatMultiValueString(editor)}</Text>
      <Text>{formatMultiValueString(album)}</Text>
      <Text>{year}</Text>
      <Text>{formatMultiValueString(place)}</Text>
    </div>
  );
};

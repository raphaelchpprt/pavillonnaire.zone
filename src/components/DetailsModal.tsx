"use client";

import { MapboxGeoJSONFeature } from "mapbox-gl";
import { ComponentProps, PropsWithChildren, FC } from "react";
import { cn, formatTypeString } from "@/utils";
import { formatMultiValueString } from "@/lib/normalize";
import { ImageCarousel } from "./ImageCarousel";

function Text({ children, className }: ComponentProps<"p">) {
  return <p className={cn("text-center", className)}>{children}</p>;
}

type DetailsModalProps = PropsWithChildren<{
  feature: MapboxGeoJSONFeature | undefined;
  onClose?: () => void;
}>;

export const DetailsModal: FC<DetailsModalProps> = ({ feature, onClose }) => {
  if (!feature) return null;

  function toggleAside() {
    document.getElementById("details-dialog")?.classList.add("hidden");
    onClose?.();
  }

  const {
    title,
    type,
    author,
    director,
    artist,
    album,
    editor,
    year,
    place,
    image,
    images: imagesRaw,
    abstract,
    link,
  } = feature.properties || {};

  let images: string[] | null = null;
  if (imagesRaw) {
    if (typeof imagesRaw === "string") {
      try {
        images = JSON.parse(imagesRaw);
      } catch {
        images = null;
      }
    } else {
      images = imagesRaw;
    }
  }

  const types = formatTypeString(type);

  return (
    <aside
      id="details-dialog"
      className="absolute invert-select right-0 top-0 z-50 hidden h-full w-full overflow-auto border border-black bg-white p-4 scrollbar-hide sm:w-[max(25%,350px)]"
    >
      {images && images.length > 0 ? (
        <ImageCarousel
          key={images[0]}
          images={images}
          alt={title}
          onClose={toggleAside}
        />
      ) : image ? (
        <ImageCarousel
          key={image}
          images={[image]}
          alt={title}
          onClose={toggleAside}
        />
      ) : null}

      <div className="flex flex-col items-center gap-2 py-2">
        <h3 className="mt-8 mb-2 text-center font-serif text-base leading-6 ">
          {title}
        </h3>

        {types && <Text className="italic lowercase">{types}</Text>}
        {author && <Text>{formatMultiValueString(author)}</Text>}
        {director && <Text>{formatMultiValueString(director)}</Text>}
        {artist && <Text>{formatMultiValueString(artist)}</Text>}
        {album && <Text>{formatMultiValueString(album)}</Text>}
        {editor && <Text>{formatMultiValueString(editor)}</Text>}
        {year && <Text>{year}</Text>}
        {place && <Text>{formatMultiValueString(place)}</Text>}
        {link && <LinkItem linkTo={link} />}
        {abstract && <Text className="text-justify text-sm">{abstract}</Text>}
      </div>
    </aside>
  );
};

const LinkItem: FC<{ linkTo: string }> = ({ linkTo }) => {
  return (
    <a
      href={linkTo}
      target="_blank"
      rel="noreferrer"
      aria-label="Voir plus"
      className="my-6 p-6 transition-transform duration-300 hover:translate-x-2"
    >
      <svg
        aria-hidden={true}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 173 27"
        className="w-20"
      >
        <path
          fill="#000"
          fillRule="evenodd"
          d="m154.943 2.722.946-1.754c2.065.898 4.03 2.337 5.91 3.713.487.357.968.71 1.443 1.047 2.384 1.69 4.695 3.075 7.269 3.392l-.088 1.269c.397.12.805.228 1.225.322l.653.147.113.66c.741 4.317-2.516 7.498-6.059 9.748-2.758 1.75-6.024 3.145-8.529 4.215a100.8 100.8 0 0 0-2.043.888l-.828-1.82c.656-.299 1.401-.617 2.202-.959 2.488-1.063 5.521-2.359 8.126-4.013 3.247-2.061 5.352-4.382 5.229-7.085a19.847 19.847 0 0 1-3.764-1.42c-13.109-.09-26.022.479-39.029 1.05-6.379.281-12.781.563-19.24.768-13.863.441-27.822.148-41.725-.145-6.43-.135-12.85-.27-19.24-.332-5.922-.057-12.016.228-18.172.515-1.783.084-3.571.167-5.362.243-7.951.336-15.932.512-23.582-.217l.19-1.992c7.504.716 15.368.546 23.308.21 1.769-.074 3.543-.157 5.317-.24 6.166-.288 12.336-.577 18.32-.519 6.44.063 12.886.198 19.33.334 13.874.292 27.743.584 41.552.144 6.407-.204 12.78-.484 19.145-.764 11.92-.524 23.811-1.046 35.829-1.064-.321-.223-.638-.45-.951-.68-.953-.701-1.888-1.443-2.817-2.18-.292-.232-.582-.463-.873-.691-1.227-.967-2.467-1.914-3.805-2.79Z"
          clipRule="evenodd"
        />
      </svg>
    </a>
  );
};

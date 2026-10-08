"use client";

import { FC } from "react";
import { Entry } from "@/types/entry";
import { LAYERS_CONFIG } from "@/constants/layers";
import { cn } from "@/utils";
import { EntryThumbnail } from "@/components/EntryThumbnail";
import { GridEntryTitle } from "@/components/GridEntryTitle";

type EntriesGridProps = {
  entries: Entry[];
  selectedEntryId?: string;
  onSelect: (entry: Entry) => void;
};

const LAYERS_BY_ID = new Map(LAYERS_CONFIG.map((l) => [l.id, l]));

export const EntriesGrid: FC<EntriesGridProps> = ({
  entries,
  selectedEntryId,
  onSelect,
}) => {
  return (
    <div className="index-content-gutter index-grid-scroll index-grid h-full w-full overflow-y-auto pb-8 scrollbar-hide">
      {entries.map((entry) => {
        const isActive = entry.id === selectedEntryId;
        const layer = LAYERS_BY_ID.get(entry.category);
        const revealOnHoverOrActive = isActive
          ? "visible"
          : "invisible group-hover:visible";

        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(entry)}
            title={entry.title}
            className={cn(
              "group w-full min-w-0 cursor-pointer text-left",
              !isActive && "grayscale hover:grayscale-0",
            )}
          >
            <div
              className={cn(
                "index-entry-media",
                isActive ? "bg-black" : "group-hover:bg-black",
              )}
            >
              <div className="index-entry-media-inner">
                <EntryThumbnail entry={entry} alt={entry.title} />
              </div>
            </div>
            <div className="index-entry-caption">
              {layer && (
                <span className="index-entry-icon">
                  <layer.OutlineIcon className="h-full w-full text-black" />
                  <layer.Icon
                    className={cn(
                      "absolute inset-0 h-full w-full",
                      revealOnHoverOrActive,
                    )}
                  />
                </span>
              )}
              <GridEntryTitle
                title={entry.title}
                className={revealOnHoverOrActive}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};

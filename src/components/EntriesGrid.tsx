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
    <div className="index-content-gutter index-grid-scroll grid h-full w-full grid-cols-2 content-start gap-x-6 gap-y-8 overflow-y-auto pb-8 scrollbar-hide sm:grid-cols-3 lg:grid-cols-5">
      {entries.map((entry) => {
        const isActive = entry.id === selectedEntryId;
        const Icon = LAYERS_BY_ID.get(entry.category)?.Icon;

        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(entry)}
            title={entry.title}
            className={cn(
              "w-full min-w-0 cursor-pointer text-left transition-[filter] duration-200",
              !isActive && "grayscale hover:grayscale-0",
            )}
          >
            <div className="index-entry-media">
              <EntryThumbnail entry={entry} alt={entry.title} />
            </div>
            <div className="index-entry-caption pt-1.5">
              <GridEntryTitle title={entry.title} />
              {Icon && <Icon className="h-5 w-5 shrink-0" aria-hidden />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

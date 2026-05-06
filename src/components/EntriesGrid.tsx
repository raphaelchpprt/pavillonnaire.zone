'use client';

import { FC } from 'react';
import { Entry } from '@/types/entry';
import { LAYERS_CONFIG } from '@/constants/layers';
import { cn } from '@/utils';

type EntriesGridProps = {
  entries: Entry[];
  selectedEntryId?: string;
  onSelect: (entry: Entry) => void;
};

const LAYERS_BY_ID = new Map(LAYERS_CONFIG.map((l) => [l.id, l]));

export const EntriesGrid: FC<EntriesGridProps> = ({ entries, selectedEntryId, onSelect }) => {
  return (
    <div className="flex h-full w-full flex-wrap content-start items-end gap-x-6 gap-y-8 overflow-y-auto px-4 py-8 sm:px-12 scrollbar-hide">
      {entries.map((entry) => {
        const isActive = entry.id === selectedEntryId;
        const Icon = LAYERS_BY_ID.get(entry.category)?.Icon;

        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(entry)}
            className={cn(
              'cursor-pointer text-left transition-[filter] duration-200',
              !isActive && 'grayscale hover:grayscale-0',
            )}
          >
            {entry.image ? (
              <img
                src={entry.image}
                alt={entry.title}
                loading="lazy"
                decoding="async"
                className="block max-w-[40vw] sm:max-w-[200px]"
              />
            ) : (
              <div className="h-32 w-[40vw] bg-gray-100 sm:h-40 sm:w-40" />
            )}
            <div className="flex items-center gap-1.5 pt-1.5 max-w-[40vw] sm:max-w-[200px]">
              <span className="flex-1 font-serif text-sm leading-tight">{entry.title}</span>
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

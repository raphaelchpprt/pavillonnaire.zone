'use client';

import { FC, useState } from 'react';
import { Entry } from '@/types/entry';
import { LAYERS_CONFIG } from '@/constants/layers';
import { cn } from '@/utils';

type EntriesGridProps = {
  entries: Entry[];
};

const LAYERS_BY_ID = new Map(LAYERS_CONFIG.map((l) => [l.id, l]));

export const EntriesGrid: FC<EntriesGridProps> = ({ entries }) => {
  const [pinned, setPinned] = useState<Set<string>>(new Set());

  const togglePin = (id: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex h-full w-full flex-wrap content-start items-end gap-x-6 gap-y-8 overflow-y-auto px-12 py-8 scrollbar-hide">
      {entries.map((entry) => {
        const isPinned = pinned.has(entry.id);
        const Icon = LAYERS_BY_ID.get(entry.category)?.Icon;

        return (
          <div
            key={entry.id}
            onClick={() => togglePin(entry.id)}
            className={cn(
              'cursor-pointer transition-[filter] duration-200',
              !isPinned && 'grayscale hover:grayscale-0',
            )}
          >
            {entry.image ? (
              <img
                src={entry.image}
                alt={entry.title}
                loading="lazy"
                decoding="async"
                className="block max-w-[200px]"
              />
            ) : (
              <div className="h-40 w-40 bg-gray-100" />
            )}
            <div className="flex items-center gap-1.5 pt-1.5 max-w-[200px]">
              <span className="flex-1 font-serif text-sm leading-tight">{entry.title}</span>
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

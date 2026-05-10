'use client';

import { FC, useState } from 'react';
import { cn } from '@/utils';

import { LAYERS_CONFIG, LayerType } from '@/constants/layers';

interface LegendFilterProps {
  selectedLayers: Set<LayerType>;
  onFilterChange: (layerId: LayerType) => void;
}

export const LegendFilter: FC<LegendFilterProps> = ({
  selectedLayers,
  onFilterChange,
}) => {
  return (
    <nav className="absolute left-6 inset-y-0 flex flex-col justify-center gap-4">
      {LAYERS_CONFIG.map((layer) => {
        const { id, label, Icon, OutlineIcon = Icon } = layer;

        const isSelected = selectedLayers.has(id);

        return (
          <button
            key={id}
            onClick={() => onFilterChange(id)}
            className={cn(
              'pointer-events-auto group relative flex items-center outline-none'
            )}
            aria-label={`Filtrer ${label}`}
            aria-pressed={isSelected}
          >
            <div className="relative h-7 w-7 ">
              <div
                className={cn(
                  'absolute inset-0 mix-blend-difference z-20 isolation-isolate',
                  isSelected
                    ? 'opacity-0'
                    : 'opacity-100 group-hover:[@media(hover:hover)]:opacity-0'
                )}
              >
                <OutlineIcon className="h-7 w-7 text-white" />
              </div>
              <div
                className={cn(
                  'absolute inset-0 z-20 isolation-isolate',
                  isSelected
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:[@media(hover:hover)]:opacity-100'
                )}
              >
                <Icon className="h-7 w-7 text-white" />
              </div>
            </div>

            <span
              className={cn(
                'absolute flex h-7 items-center left-full ml-4 whitespace-nowrap border border-white/20 bg-black px-3 text-xs text-white font-serif tracking-wider z-20 backdrop-blur-sm bg-neutral-800/50',
                'opacity-0 pointer-events-none',
                'group-hover:[@media(hover:hover)]:opacity-100 group-hover:[@media(hover:hover)]:pointer-events-auto group-hover:[@media(hover:hover)]:bg-neutral-600/50',
                isSelected && 'opacity-100 pointer-events-auto'
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

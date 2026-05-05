'use client';

import { cn } from '@/utils';
import { FC, useEffect, useRef, useState } from 'react';
import { ActiveFilters, Facets, FilterField, ViewMode } from '@/types/entry';

type FilterPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  facets: Facets;
  activeFilters: ActiveFilters;
  onFilterChange: (field: FilterField, value: string) => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
};

const SECTIONS: { field: FilterField; title: string }[] = [
  { field: 'date', title: 'Date' },
  { field: 'author', title: 'Auteur.ices' },
  { field: 'place', title: 'Lieu' },
  { field: 'type', title: 'Type' },
];

export const FilterPanel: FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  facets,
  activeFilters,
  onFilterChange,
  currentView,
  onViewChange,
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  return (
    <aside
      aria-label="Filtres"
      aria-hidden={!isOpen}
      className={cn(
        'fixed right-0 top-0 z-40 flex h-full w-[min(100%,360px)] flex-col text-white mix-blend-difference transition-transform duration-200 ease-out',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      <header>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-xl font-bold">filtres</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer les filtres"
            className="cursor-pointer text-xl leading-none"
          >
            x
          </button>
        </div>
        <div className="flex items-center gap-1 px-4 pb-3 text-xl">
          <button
            type="button"
            onClick={() => onViewChange('map')}
            className={cn('cursor-pointer', currentView === 'map' && 'font-bold')}
          >
            Carte
          </button>
          <span aria-hidden="true"> ↔ </span>
          <button
            type="button"
            onClick={() => onViewChange('grid')}
            className={cn('cursor-pointer', currentView === 'grid' && 'font-bold')}
          >
            Grille
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        {SECTIONS.map(({ field, title }) => (
          <CollapsibleSection
            key={field}
            title={title}
            values={facets[field]}
            activeValues={activeFilters[field]}
            onToggle={(value) => onFilterChange(field, value)}
          />
        ))}
      </div>
    </aside>
  );
};

type CollapsibleSectionProps = {
  title: string;
  values: string[];
  activeValues: string[];
  onToggle: (value: string) => void;
};

const CollapsibleSection: FC<CollapsibleSectionProps> = ({
  title,
  values,
  activeValues,
  onToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <section className="py-1">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="flex w-full cursor-pointer items-center justify-between text-xl"
      >
        <span className="font-bold">{title}</span>
        <span aria-hidden="true">{isExpanded ? '↑' : '↓'}</span>
      </button>
      {isExpanded && (
        <div className="flex flex-col py-1 text-xl">
          {values.length === 0 && <span className="opacity-60">—</span>}
          {values.map((value) => {
            const isActive = activeValues.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => onToggle(value)}
                aria-pressed={isActive}
                className={cn(
                  'flex cursor-pointer items-center justify-between px-1 text-left',
                  isActive
                    ? 'bg-white text-black'
                    : 'bg-transparent text-white hover:underline',
                )}
              >
                <span>{value}</span>
                {isActive && <span aria-hidden="true">×</span>}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

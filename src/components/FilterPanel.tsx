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
  hasActiveFilters: boolean;
  onReset: () => void;
};

const SECTIONS: { field: FilterField; title: string }[] = [
  { field: 'date', title: 'Date' },
  { field: 'author', title: 'Auteur.ices' },
  { field: 'place', title: 'Lieu' },
  { field: 'type', title: 'Type' },
];

/** Colonne droite partagée (croix, flèches, ×) — alignée sur right-6 du bouton [i] */
const panelRowGrid =
  'grid w-full grid-cols-[minmax(0,1fr)_1.75rem] items-center';

const panelControlCell = 'flex h-7 items-center justify-center';

const viewToggleClass = (isActive: boolean, isGridView: boolean) =>
  cn(
    'cursor-pointer px-1.5 py-0.5 transition-colors',
    isGridView
      ? cn(
          isActive &&
            'max-md:bg-black max-md:font-bold max-md:text-white md:bg-white md:font-bold md:text-black',
          !isActive &&
            'max-md:text-black max-md:hover:bg-black max-md:hover:text-white md:text-white md:hover:bg-white md:hover:text-black',
        )
      : cn(
          isActive && 'bg-white font-bold text-black',
          !isActive && 'text-white hover:bg-white hover:text-black',
        ),
  );

const filterValueClass = (isActive: boolean, isGridView: boolean) =>
  cn(
    panelRowGrid,
    'cursor-pointer px-1 text-left',
    isGridView
      ? cn(
          isActive &&
            'max-md:bg-black max-md:text-white md:bg-white md:text-black',
          !isActive &&
            'max-md:text-black max-md:hover:bg-black max-md:hover:text-white md:bg-transparent md:text-white md:hover:bg-white md:hover:text-black',
        )
      : cn(
          isActive && 'bg-white text-black',
          !isActive &&
            'bg-transparent text-white hover:bg-white hover:text-black',
        ),
  );

export const FilterPanel: FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  facets,
  activeFilters,
  onFilterChange,
  currentView,
  onViewChange,
  hasActiveFilters,
  onReset,
}) => {
  const isGridView = currentView === 'grid';
  const asideRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    if (isOpen) {
      el.removeAttribute('inert');
      closeRef.current?.focus();
    } else {
      el.setAttribute('inert', '');
    }
  }, [isOpen]);

  return (
    <aside
      ref={asideRef}
      aria-label="Filtres"
      className={cn(
        'fixed right-0 top-0 z-40 flex h-full w-full flex-col text-lg transition-transform duration-200 ease-out md:w-[min(100%,var(--layout-rail))]',
        'max-md:mix-blend-normal',
        isGridView
          ? 'max-md:bg-white max-md:text-black'
          : 'max-md:bg-black max-md:text-white',
        'md:bg-transparent md:text-white md:mix-blend-difference',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      <header className="px-6 pt-6">
        <div className={panelRowGrid}>
          <h2 className="font-bold leading-snug">filtres</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer les filtres"
            className={cn(panelControlCell, 'cursor-pointer leading-none')}
          >
            x
          </button>
        </div>
        <div
          className="flex items-center gap-1.5 pb-3 pt-2"
          role="group"
          aria-label="Vue"
        >
          <button
            type="button"
            onClick={() => onViewChange('map')}
            aria-pressed={currentView === 'map'}
            className={viewToggleClass(currentView === 'map', isGridView)}
          >
            Carte
          </button>
          <span aria-hidden="true" className="select-none opacity-50">
            ↔
          </span>
          <button
            type="button"
            onClick={() => onViewChange('grid')}
            aria-pressed={currentView === 'grid'}
            className={viewToggleClass(currentView === 'grid', isGridView)}
          >
            Index
          </button>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className={cn(
              viewToggleClass(false, isGridView),
              'mb-2 cursor-pointer text-left',
            )}
          >
            reset
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
        {SECTIONS.map(({ field, title }) => (
          <CollapsibleSection
            key={field}
            title={title}
            values={facets[field]}
            activeValues={activeFilters[field]}
            onToggle={(value) => onFilterChange(field, value)}
            isGridView={isGridView}
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
  isGridView: boolean;
};

const CollapsibleSection: FC<CollapsibleSectionProps> = ({
  title,
  values,
  activeValues,
  onToggle,
  isGridView,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <section className="py-1">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className={cn(panelRowGrid, 'cursor-pointer text-left')}
      >
        <span className="font-bold">{title}</span>
        <span aria-hidden="true" className={panelControlCell}>
          {isExpanded ? '↑' : '↓'}
        </span>
      </button>
      {isExpanded && (
        <div className="flex flex-col py-1">
          {values.length === 0 && <span className="opacity-60">—</span>}
          {values.map((value) => {
            const isActive = activeValues.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => onToggle(value)}
                aria-pressed={isActive}
                className={filterValueClass(isActive, isGridView)}
              >
                <span className={cn('min-w-0', isActive && 'font-bold')}>
                  {value}
                </span>
                <span className={panelControlCell}>
                  {isActive && (
                    <span aria-hidden="true" className="font-bold">
                      ×
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

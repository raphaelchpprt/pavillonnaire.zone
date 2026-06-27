"use client";

import { formatMultiValueString } from "@/lib/normalize";
import { cn } from "@/utils";
import { FC, useEffect, useRef, useState } from "react";
import {
  ActiveFilters,
  EntrySort,
  Facets,
  FilterField,
  ViewMode,
} from "@/types/entry";

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
  entrySort: EntrySort;
  onEntrySortChange: (sort: EntrySort) => void;
};

const ENTRY_SORT_LABELS: Record<EntrySort, string> = {
  title: "titres A → Z",
  "date-desc": "date décroissante",
  "date-asc": "date croissante",
};

const SortAlphabetIcon: FC<{ className?: string }> = ({ className }) => (
  <span
    className={cn("inline-flex items-center gap-0.5 leading-none", className)}
    aria-hidden
  >
    <span className="flex flex-col text-[0.5rem] font-bold leading-[0.9]">
      <span>A</span>
      <span>B</span>
    </span>
    <span className="text-[0.65rem] leading-none">↓</span>
  </span>
);

const SECTIONS: { field: FilterField; title: string }[] = [
  { field: "date", title: "Date" },
  { field: "author", title: "Auteur.ices" },
  { field: "place", title: "Lieu" },
  { field: "type", title: "Type" },
];

/** Colonne droite partagée (croix, flèches, ×) — alignée sur right-6 du bouton [i] */
const panelRowGrid =
  "grid w-full grid-cols-[minmax(0,1fr)_1.75rem] items-center";

/** Bloc aligné sur le champ Recherche : même largeur (geocoder Mapbox),
    ancré au bord droit commun (px-6 du panneau = margin-right de la searchbar). */
const dropdownAlignBlock =
  "ml-auto w-[var(--filter-dropdown-width)] max-w-full";

const panelControlCell = "flex h-7 items-center justify-center";

const panelButtonBorder = "border-[1.5px] border-current";

const panelCloseButtonClass = (isGridView: boolean) =>
  cn(
    "grid h-7 w-7 shrink-0 cursor-pointer place-items-center transition-colors",
    panelButtonBorder,
    isGridView
      ? "border-black text-black hover:bg-black hover:text-white"
      : "border-white text-white hover:bg-white hover:text-black",
  );

const panelToggleButtonClass = (isActive: boolean, isGridView: boolean) =>
  cn(
    "cursor-pointer px-1.5 py-0.5 transition-colors disabled:cursor-default disabled:pointer-events-none",
    panelButtonBorder,
    isGridView
      ? cn(
          isActive && "bg-black text-white",
          !isActive && "text-black hover:bg-black hover:text-white",
        )
      : cn(
          isActive && "bg-white text-black",
          !isActive && "text-white hover:bg-white hover:text-black",
        ),
  );

const panelSortButtonClass = (isActive: boolean, isGridView: boolean) =>
  cn(
    panelToggleButtonClass(isActive, isGridView),
    "text-base leading-none px-1.5 py-0.5",
  );

const filterValueClass = (isActive: boolean, isGridView: boolean) =>
  cn(
    panelRowGrid,
    "cursor-pointer px-1 text-left",
    isGridView
      ? cn(
          isActive && "bg-black text-white",
          !isActive && "text-black hover:bg-black hover:text-white",
        )
      : cn(
          isActive && "bg-white text-black",
          !isActive &&
            "bg-transparent text-white hover:bg-white hover:text-black",
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
  entrySort,
  onEntrySortChange,
}) => {
  const isGridView = currentView === "grid";
  const asideRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    if (isOpen) {
      el.removeAttribute("inert");
      closeRef.current?.focus();
    } else {
      el.setAttribute("inert", "");
    }
  }, [isOpen]);

  return (
    <aside
      ref={asideRef}
      aria-label="Filtres"
      data-filter-open={isOpen ? "" : undefined}
      className={cn(
        "fixed right-0 top-0 z-40 flex h-full w-full flex-col text-lg md:w-[min(100%,var(--layout-rail))]",
        isGridView
          ? "bg-white text-black"
          : "max-md:bg-black max-md:text-white md:bg-transparent md:text-white md:mix-blend-difference",
        isOpen && "pointer-events-none",
        !isOpen && "hidden",
      )}
    >
      <header className="pointer-events-auto px-6 pt-6">
        <div className={dropdownAlignBlock}>
          <div className={panelRowGrid}>
            <h2 className="font-bold leading-snug">Filtres</h2>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Fermer les filtres"
              className={panelCloseButtonClass(isGridView)}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                x
              </span>
            </button>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 pb-3 pt-2",
              isGridView && "pb-4",
            )}
            role="group"
            aria-label="Vue"
          >
            <button
              type="button"
              onClick={() => onViewChange("map")}
              aria-pressed={currentView === "map"}
              className={panelToggleButtonClass(
                currentView === "map",
                isGridView,
              )}
            >
              Carte
            </button>
            <span aria-hidden="true" className="select-none opacity-50">
              ↔
            </span>
            <button
              type="button"
              onClick={() => onViewChange("grid")}
              aria-pressed={currentView === "grid"}
              className={panelToggleButtonClass(
                currentView === "grid",
                isGridView,
              )}
            >
              Index
            </button>
            {!isGridView && (
              <button
                type="button"
                onClick={onReset}
                aria-pressed={hasActiveFilters}
                className={cn(
                  panelToggleButtonClass(hasActiveFilters, isGridView),
                  "ml-auto",
                )}
              >
                reset
              </button>
            )}
          </div>
          {isGridView && (
            <div
              className="flex flex-wrap items-center gap-1.5 border-t border-black pb-3 pt-4"
              role="group"
              aria-label="Tri et réinitialisation"
            >
              <button
                type="button"
                onClick={() => onEntrySortChange("title")}
                aria-pressed={entrySort === "title"}
                aria-label={ENTRY_SORT_LABELS.title}
                className={panelSortButtonClass(
                  entrySort === "title",
                  isGridView,
                )}
              >
                <span className="flex items-center gap-1.5">
                  trier
                  <SortAlphabetIcon />
                </span>
              </button>
              <button
                type="button"
                onClick={() => onEntrySortChange("date-desc")}
                aria-pressed={entrySort === "date-desc"}
                className={panelSortButtonClass(
                  entrySort === "date-desc",
                  isGridView,
                )}
              >
                date ↓
              </button>
              <button
                type="button"
                onClick={() => onEntrySortChange("date-asc")}
                aria-pressed={entrySort === "date-asc"}
                className={panelSortButtonClass(
                  entrySort === "date-asc",
                  isGridView,
                )}
              >
                date ↑
              </button>
              <button
                type="button"
                onClick={onReset}
                aria-pressed={hasActiveFilters}
                className={cn(
                  panelSortButtonClass(hasActiveFilters, isGridView),
                  "ml-auto",
                )}
              >
                reset
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div className="pointer-events-auto h-full overflow-y-auto px-6 py-4 scrollbar-hide filter-panel-scroll">
          <div className={dropdownAlignBlock}>
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
        </div>
        <div
          className={cn(
            "filter-panel-search-scrim",
            isGridView
              ? "filter-panel-search-scrim--light"
              : "filter-panel-search-scrim--dark",
          )}
          aria-hidden
        />
        <div className="filter-panel-search-reserve" aria-hidden />
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
        className={cn(panelRowGrid, "cursor-pointer text-left")}
      >
        <span className="font-bold">{title}</span>
        <span aria-hidden="true" className={panelControlCell}>
          {isExpanded ? "↑" : "↓"}
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
                <span className="min-w-0 line-clamp-2 leading-snug">
                  {formatMultiValueString(value)}
                </span>
                <span className={panelControlCell}>
                  {isActive && <span aria-hidden="true">×</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

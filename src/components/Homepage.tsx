"use client";

import { About } from "@/components/About";
import { Instagram } from "@/components/Instagram";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/utils";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ABOUT_PATH, ROOT_PATH } from "@/paths";
import { useMapBox } from "@/hooks/useMapBox";
import { useEntries } from "@/hooks/useEntries";
import { DetailsModal } from "@/components/DetailsModal";
import { LegendFilter } from "@/components/LegendFilter";
import { IndexButton } from "@/components/IndexButton";
import { FilterPanel } from "@/components/FilterPanel";
import { EntriesGrid } from "@/components/EntriesGrid";
import { GridStatus } from "@/components/GridStatus";
import { computeFacets } from "@/lib/facets";
import { matchesFilterSelection } from "@/lib/normalize";
import { sortEntries } from "@/lib/sortEntries";
import {
  parseFiltersFromUrl,
  parseSortFromUrl,
  buildFilterUrl,
  buildFiltersResetUrl,
  buildSortUrl,
  buildViewUrl,
  buildIndexOpenUrl,
  buildIndexCloseUrl,
} from "@/lib/filtersUrl";
import { Entry, FilterField, EntrySort, ViewMode } from "@/types/entry";
import { MapboxGeoJSONFeature } from "mapbox-gl";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

export default function Homepage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const isAboutOpen = view === "about";
  const isGridView = view === "grid";
  const isIndexOpen = searchParams.get("index") === "open";

  const activeFilters = useMemo(
    () => parseFiltersFromUrl(searchParams),
    [searchParams],
  );
  const entrySort = useMemo(
    () => parseSortFromUrl(searchParams),
    [searchParams],
  );

  const {
    mapContainerRef,
    feature,
    toggleLayer,
    clearSelectedLayers,
    selectedLayers,
    isMapLoaded,
  } = useMapBox(activeFilters);

  const { entries, isLoading, error, reload } = useEntries();
  const facets = useMemo(() => computeFacets(entries), [entries]);

  const filteredEntries = useMemo(() => {
    const { date, author, place, type } = activeFilters;
    return entries.filter(
      (entry) =>
        (selectedLayers.size === 0 || selectedLayers.has(entry.category)) &&
        (date.length === 0 ||
          (entry.year != null && date.includes(String(entry.year)))) &&
        matchesFilterSelection(entry.types, type) &&
        matchesFilterSelection(entry.places, place) &&
        matchesFilterSelection(entry.authors, author),
    );
  }, [entries, activeFilters, selectedLayers]);

  const sortedEntries = useMemo(
    () => sortEntries(filteredEntries, entrySort),
    [filteredEntries, entrySort],
  );

  const [gridSelectedEntry, setGridSelectedEntry] = useState<
    Entry | undefined
  >();

  // DetailsModal only reads `properties`, so the entry itself stands in for a map feature.
  const gridFeature = useMemo(
    () =>
      gridSelectedEntry &&
      ({ properties: gridSelectedEntry } as unknown as MapboxGeoJSONFeature),
    [gridSelectedEntry],
  );

  const closeGridDetails = () => {
    document.getElementById("details-dialog")?.classList.add("hidden");
    setGridSelectedEntry(undefined);
  };

  const toggleFilter = (field: FilterField, value: string) => {
    const current = activeFilters[field];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    router.push(
      buildFilterUrl({ ...activeFilters, [field]: next }, searchParams),
    );
  };

  const handleViewChange = (v: ViewMode) => {
    router.push(buildViewUrl(v, searchParams));
  };

  const handleEntrySortChange = (sort: EntrySort) => {
    router.push(buildSortUrl(sort, searchParams));
  };

  const handleResetFilters = () => {
    clearSelectedLayers();
    router.push(buildFiltersResetUrl(searchParams));
  };

  useEffect(() => {
    document.documentElement.classList.toggle("index-grid-view", isGridView);
    return () => document.documentElement.classList.remove("index-grid-view");
  }, [isGridView]);

  useEffect(() => {
    if (!isAboutOpen) return;
    function hideAbout(e: KeyboardEvent) {
      if (e.key === "Escape") router.push(ROOT_PATH);
    }
    document.body.addEventListener("keydown", hideAbout);
    return () => document.body.removeEventListener("keydown", hideAbout);
  }, [router, isAboutOpen]);

  const prevIsIndexOpen = useRef(false);
  useEffect(() => {
    if (prevIsIndexOpen.current && !isIndexOpen) {
      (
        document.getElementById("index-button") as HTMLButtonElement | null
      )?.focus();
    }
    prevIsIndexOpen.current = isIndexOpen;
  }, [isIndexOpen]);

  useEffect(() => {
    if (!isIndexOpen) return;
    function hidePanel(e: KeyboardEvent) {
      if (e.key === "Escape") router.push(buildIndexCloseUrl(searchParams));
    }
    document.body.addEventListener("keydown", hidePanel);
    return () => document.body.removeEventListener("keydown", hidePanel);
  }, [router, isIndexOpen, searchParams]);

  useEffect(() => {
    function hideDetailsModal(e: KeyboardEvent) {
      if (e.key === "Escape") {
        document.getElementById("details-dialog")?.classList.add("hidden");
        setGridSelectedEntry(undefined);
      }
    }

    document.body.addEventListener("keydown", hideDetailsModal);
    return () => {
      document.body.removeEventListener("keydown", hideDetailsModal);
    };
  }, []);

  useEffect(() => {
    if (!isGridView || !gridSelectedEntry) return;
    document.getElementById("details-dialog")?.classList.remove("hidden");
  }, [isGridView, gridSelectedEntry]);

  return (
    <>
      <Link
        href={ABOUT_PATH}
        onClick={
          isAboutOpen
            ? (e) => {
                e.preventDefault();
                router.back();
              }
            : undefined
        }
        className="group absolute left-6 top-6 z-30 flex h-7 w-7 cursor-pointer items-center justify-center border-[1.5px] border-white fill-current text-white mix-blend-difference"
      >
        <div className="h-2.5 w-2.5 rotate-45 transform bg-white transition duration-300 ease-in-out group-hover:rotate-0" />
      </Link>

      {!isAboutOpen && !isIndexOpen && (
        <IndexButton
          onClick={() => router.push(buildIndexOpenUrl(searchParams))}
        />
      )}

      <FilterPanel
        isOpen={isIndexOpen}
        onClose={() => router.push(buildIndexCloseUrl(searchParams))}
        facets={facets}
        activeFilters={activeFilters}
        onFilterChange={toggleFilter}
        currentView={isGridView ? "grid" : "map"}
        onViewChange={handleViewChange}
        onReset={handleResetFilters}
        entrySort={entrySort}
        onEntrySortChange={handleEntrySortChange}
      />

      {isAboutOpen && (
        <>
          <div
            className="index-header-fade index-header-fade--dark pointer-events-none fixed inset-x-0 top-0 z-[15]"
            aria-hidden
          />
          <div className="flex h-full w-full items-start justify-center overflow-auto p-6 py-20 scrollbar-hide md:p-20">
            <About />
          </div>
          <Instagram />
        </>
      )}

      <div
        className="map-container relative h-full w-full"
        ref={mapContainerRef}
      >
        {!isAboutOpen && (isMapLoaded || isGridView) && (
          <LegendFilter
            selectedLayers={selectedLayers}
            onFilterChange={toggleLayer}
            surface={isGridView ? "grid" : "map"}
            className={cn(isIndexOpen && "max-md:hidden")}
          />
        )}
      </div>

      <DetailsModal
        feature={isGridView ? gridFeature : feature}
        onClose={isGridView ? () => setGridSelectedEntry(undefined) : undefined}
      />

      {isGridView && (
        <>
          <div
            className={cn(
              "index-header-fade pointer-events-none fixed inset-x-0 top-0 z-[15]",
              isIndexOpen && "max-md:hidden",
            )}
            aria-hidden
          />
          <div
            className={cn(
              "absolute inset-0 z-10 bg-white",
              isIndexOpen && "max-md:hidden",
            )}
          >
            {error ? (
              <GridStatus kind="error" onRetry={reload} />
            ) : isLoading ? (
              <GridStatus kind="loading" />
            ) : sortedEntries.length === 0 ? (
              entries.length === 0 ? (
                <GridStatus kind="empty" />
              ) : (
                <GridStatus
                  kind="empty-filtered"
                  onReset={handleResetFilters}
                />
              )
            ) : (
              <EntriesGrid
                entries={sortedEntries}
                selectedEntryId={gridSelectedEntry?.id}
                onSelect={setGridSelectedEntry}
                onBackgroundClick={closeGridDetails}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}

'use client';

import { About } from '@/components/About';
import { Instagram } from '@/components/Instagram';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ABOUT_PATH, ROOT_PATH } from '@/paths';
import { useMapBox } from '@/hooks/useMapBox';
import { useEntries } from '@/hooks/useEntries';
import { DetailsModal } from '@/components/DetailsModal';
import { LegendFilter } from '@/components/LegendFilter';
import { IndexButton } from '@/components/IndexButton';
import { FilterPanel } from '@/components/FilterPanel';
import { EntriesGrid } from '@/components/EntriesGrid';
import { computeFacets } from '@/lib/facets';
import { parseFiltersFromUrl, buildFilterUrl, buildViewUrl, buildIndexOpenUrl, buildIndexCloseUrl } from '@/lib/filtersUrl';
import { Entry, FilterField, ViewMode } from '@/types/entry';
import { LayerType } from '@/constants/layers';
import { MapboxGeoJSONFeature } from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

export default function Homepage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const isAboutOpen = view === 'about';
  const isGridView = view === 'grid';
  const isIndexOpen = searchParams.get('index') === 'open';

  const activeFilters = useMemo(
    () => parseFiltersFromUrl(searchParams),
    [searchParams],
  );

  const { mapContainerRef, feature, toggleLayer, selectedLayers, isMapLoaded } =
    useMapBox(activeFilters);

  const { entries } = useEntries();
  const facets = useMemo(() => computeFacets(entries), [entries]);

  const filteredEntries = useMemo(() => {
    const { date, author, place, type } = activeFilters;
    const hasCategoryFilter = selectedLayers.size > 0;
    const hasFieldFilter = date.length || author.length || place.length || type.length;
    if (!hasCategoryFilter && !hasFieldFilter) return entries;
    return entries.filter((entry) => {
      if (hasCategoryFilter && !selectedLayers.has(entry.category)) return false;
      if (date.length && (entry.year == null || !date.includes(String(entry.year)))) return false;
      if (type.length && !type.includes(entry.type ?? '')) return false;
      if (place.length && !place.includes(entry.place ?? '')) return false;
      if (author.length && !entry.authors.some((a) => author.includes(a))) return false;
      return true;
    });
  }, [entries, activeFilters, selectedLayers]);

  const [gridSelectedEntry, setGridSelectedEntry] = useState<Entry | undefined>();

  const gridFeature = useMemo((): MapboxGeoJSONFeature | undefined => {
    if (!gridSelectedEntry) return undefined;
    const e = gridSelectedEntry;
    return {
      type: 'Feature',
      id: e.id,
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: {
        title: e.title,
        type: e.type ?? null,
        author: e.author ?? null,
        director: e.director ?? null,
        artist: e.artist ?? null,
        album: e.album ?? null,
        editor: e.editor ?? null,
        year: e.year ?? null,
        place: e.place ?? null,
        image: e.image ?? null,
        images: e.images ? JSON.stringify(e.images) : null,
        abstract: e.abstract ?? null,
        link: e.link ?? null,
      },
      layer: {} as mapboxgl.Layer,
      source: '',
      sourceLayer: '',
      state: {},
    } as unknown as MapboxGeoJSONFeature;
  }, [gridSelectedEntry]);

  const toggleFilter = (field: FilterField, value: string) => {
    const current = activeFilters[field];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    router.push(buildFilterUrl({ ...activeFilters, [field]: next }, searchParams));
  };

  const handleViewChange = (v: ViewMode) => {
    router.push(buildViewUrl(v, searchParams));
  };

  useEffect(() => {
    if (!isAboutOpen) return;
    function hideAbout(e: KeyboardEvent) {
      if (e.key === 'Escape') router.push(ROOT_PATH);
    }
    document.body.addEventListener('keydown', hideAbout);
    return () => document.body.removeEventListener('keydown', hideAbout);
  }, [router, isAboutOpen]);

  const prevIsIndexOpen = useRef(false);
  useEffect(() => {
    if (prevIsIndexOpen.current && !isIndexOpen) {
      (document.getElementById('index-button') as HTMLButtonElement | null)?.focus();
    }
    prevIsIndexOpen.current = isIndexOpen;
  }, [isIndexOpen]);

  useEffect(() => {
    if (!isIndexOpen) return;
    function hidePanel(e: KeyboardEvent) {
      if (e.key === 'Escape') router.push(buildIndexCloseUrl(searchParams));
    }
    document.body.addEventListener('keydown', hidePanel);
    return () => document.body.removeEventListener('keydown', hidePanel);
  }, [router, isIndexOpen, searchParams]);

  useEffect(() => {
    function hideDetailsModal(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        document.getElementById('details-dialog')?.classList.add('hidden');
        setGridSelectedEntry(undefined);
      }
    }

    document.body.addEventListener('keydown', hideDetailsModal);
    return () => {
      document.body.removeEventListener('keydown', hideDetailsModal);
    };
  }, []);

  useEffect(() => {
    if (!isGridView || !gridSelectedEntry) return;
    document.getElementById('details-dialog')?.classList.remove('hidden');
  }, [isGridView, gridSelectedEntry]);

  return (
    <>
      <Link
        href={ABOUT_PATH}
        onClick={isAboutOpen ? (e) => { e.preventDefault(); router.back(); } : undefined}
        className="group absolute left-6 top-6 z-30 flex h-7 w-7 cursor-pointer items-center justify-center border-[1.5px] border-white fill-current text-white mix-blend-difference"
      >
        <div className="h-2.5 w-2.5 rotate-45 transform bg-white transition duration-300 ease-in-out group-hover:rotate-0" />
      </Link>

      {!isAboutOpen && !isIndexOpen && (
        <IndexButton onClick={() => router.push(buildIndexOpenUrl(searchParams))} />
      )}

      <FilterPanel
        isOpen={isIndexOpen}
        onClose={() => router.push(buildIndexCloseUrl(searchParams))}
        facets={facets}
        activeFilters={activeFilters}
        onFilterChange={toggleFilter}
        currentView={isGridView ? 'grid' : 'map'}
        onViewChange={handleViewChange}
      />

      {isAboutOpen && (
        <>
          <div className="flex h-full w-full items-start justify-center p-6 py-20 md:p-20">
            <About />
          </div>
          <Instagram />
        </>
      )}

      <div
        className={cn(
          'map-container relative h-full w-full',
          isGridView && 'hidden',
        )}
        ref={mapContainerRef}
      />

      <div
        className={cn(
          'absolute inset-y-0 left-0 z-20 transition-opacity duration-300 ease-in-out',
          isMapLoaded && !isGridView ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      >
        <LegendFilter
          selectedLayers={selectedLayers}
          onFilterChange={toggleLayer}
        />
      </div>

      <DetailsModal
        feature={isGridView ? gridFeature : feature}
        onClose={isGridView ? () => setGridSelectedEntry(undefined) : undefined}
      />

      {isGridView && (
        <div className="absolute inset-0 z-10 bg-white">
          <EntriesGrid
            entries={filteredEntries}
            selectedEntryId={gridSelectedEntry?.id}
            onSelect={(entry) => {
              setGridSelectedEntry(entry);
            }}
          />
        </div>
      )}
    </>
  );
}

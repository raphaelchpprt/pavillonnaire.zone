'use client';

import { About } from '@/components/About';
import { Instagram } from '@/components/Instagram';
import { useEffect, useMemo } from 'react';
import { cn } from '@/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ABOUT_PATH, INDEX_PATH, ROOT_PATH } from '@/paths';
import { useMapBox } from '@/hooks/useMapBox';
import { useEntries } from '@/hooks/useEntries';
import { DetailsModal } from '@/components/DetailsModal';
import { LegendFilter } from '@/components/LegendFilter';
import { IndexButton } from '@/components/IndexButton';
import { FilterPanel } from '@/components/FilterPanel';
import { EntriesGrid } from '@/components/EntriesGrid';
import { computeFacets } from '@/lib/facets';
import { parseFiltersFromUrl, buildFilterUrl } from '@/lib/filtersUrl';
import { FilterField, ViewMode } from '@/types/entry';
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

  const { entries } = useEntries();
  const facets = useMemo(() => computeFacets(entries), [entries]);

  const filteredEntries = useMemo(() => {
    const { date, author, place, type } = activeFilters;
    if (!date.length && !author.length && !place.length && !type.length) return entries;
    return entries.filter((entry) => {
      if (date.length && !date.includes(String(entry.year ?? ''))) return false;
      if (type.length && !type.includes(entry.type ?? '')) return false;
      if (place.length && !place.includes(entry.place ?? '')) return false;
      if (author.length && !entry.authors.some((a) => author.includes(a))) return false;
      return true;
    });
  }, [entries, activeFilters]);

  const toggleFilter = (field: FilterField, value: string) => {
    const current = activeFilters[field];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    router.push(buildFilterUrl({ ...activeFilters, [field]: next }, searchParams));
  };

  const handleViewChange = (v: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (v === 'grid') {
      params.set('view', 'grid');
    } else {
      params.delete('view');
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  };

  useEffect(() => {
    function hideAbout(e: KeyboardEvent) {
      if (isAboutOpen && e.key === 'Escape') router.push(ROOT_PATH);
    }

    document.body.addEventListener('keydown', hideAbout);
    return () => {
      document.body.removeEventListener('keydown', hideAbout);
    };
  }, [router, isAboutOpen]);

  useEffect(() => {
    function hideDetailsModal(e: KeyboardEvent) {
      if (e.key === 'Escape')
        document.getElementById('details-dialog')?.classList.add('hidden');
    }

    document.body.addEventListener('keydown', hideDetailsModal);
    return () => {
      document.body.removeEventListener('keydown', hideDetailsModal);
    };
  }, []);

  const { mapContainerRef, feature, toggleLayer, selectedLayers, isMapLoaded } =
    useMapBox(activeFilters);

  return (
    <>
      <Link
        href={isAboutOpen ? ROOT_PATH : ABOUT_PATH}
        className="group absolute left-6 top-6 z-20 flex h-7 w-7 cursor-pointer items-center justify-center border-[1.5px] border-white fill-current text-white mix-blend-difference"
      >
        <div className="h-2.5 w-2.5 rotate-45 transform bg-white transition duration-300 ease-in-out group-hover:rotate-0" />
      </Link>

      {!isAboutOpen && !isIndexOpen && (
        <IndexButton onClick={() => router.push(INDEX_PATH)} />
      )}

      <FilterPanel
        isOpen={isIndexOpen}
        onClose={() => router.push(ROOT_PATH)}
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
      >
        <div
          className={cn(
            'transition-opacity duration-300 ease-in-out',
            isMapLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
        >
          <LegendFilter
            selectedLayers={selectedLayers}
            onFilterChange={toggleLayer}
          />
        </div>
        <DetailsModal feature={feature} />
      </div>

      {isGridView && (
        <div className="absolute inset-0 z-10 bg-white">
          <EntriesGrid entries={filteredEntries} />
        </div>
      )}
    </>
  );
}

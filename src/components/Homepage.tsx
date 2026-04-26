'use client';

import { About } from '@/components/About';
import { Instagram } from '@/components/Instagram';
import { useEffect } from 'react';
import { cn } from '@/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ABOUT_PATH, INDEX_PATH, ROOT_PATH } from '@/paths';
import { useMapBox } from '@/hooks/useMapBox';
import { DetailsModal } from '@/components/DetailsModal';
import { LegendFilter } from '@/components/LegendFilter';
import { IndexButton } from '@/components/IndexButton';
import { FilterPanel } from '@/components/FilterPanel';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

export default function Homepage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const isAboutOpen = view === 'about';
  const isIndexOpen = searchParams.get('index') === 'open';

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
    useMapBox();

  return (
    <>
      <Link
        href={isAboutOpen ? ROOT_PATH : ABOUT_PATH}
        className="group absolute left-6 top-6 z-20 flex h-7 w-7 cursor-pointer items-center justify-center border-[1.5px] border-white fill-current text-white mix-blend-difference"
      >
        <div className="h-2.5 w-2.5 rotate-45 transform bg-white transition duration-300 ease-in-out group-hover:rotate-0" />
      </Link>

      {!isAboutOpen && (
        <IndexButton onClick={() => router.push(INDEX_PATH)} />
      )}

      <FilterPanel
        isOpen={isIndexOpen}
        onClose={() => router.push(ROOT_PATH)}
      />

      {isAboutOpen && (
        <>
          <div className="flex h-full w-full items-start justify-center p-6 py-20 md:p-20">
            <About />
          </div>
          <Instagram />
        </>
      )}

      {mapContainerRef && (
        <div
          className="map-container relative h-full w-full"
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
      )}
    </>
  );
}
